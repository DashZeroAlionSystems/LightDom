/**
 * Feedback Loop Service
 * 
 * Manages the complete feedback loop system including:
 * - User feedback collection and storage
 * - Preference learning from feedback patterns
 * - A/B testing for response styles
 * - Communication logging
 * - Workflow state management
 */

import { Pool } from 'pg';
import { randomBytes } from 'crypto';

export class FeedbackLoopService {
  constructor(dbPool) {
    this.db = dbPool;
  }

  /**
   * Record user feedback on a response
   */
  async recordFeedback({
    sessionId,
    userId = null,
    conversationId,
    messageId,
    feedbackType, // 'positive' | 'negative' | 'neutral'
    feedbackStrength = 3,
    feedbackReason = null,
    prompt,
    response,
    modelUsed = null,
    templateStyle = null,
    workflowStage = 'response_generated',
    metadata = {}
  }) {
    try {
      const result = await this.db.query(
        `INSERT INTO user_feedback (
          session_id, user_id, conversation_id, message_id,
          feedback_type, feedback_strength, feedback_reason,
          prompt, response, model_used, template_style,
          response_length, workflow_stage, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          sessionId, userId, conversationId, messageId,
          feedbackType, feedbackStrength, feedbackReason,
          prompt, response, modelUsed, templateStyle,
          response.length, workflowStage, JSON.stringify(metadata)
        ]
      );

      const feedback = result.rows[0];

      // Analyze feedback to update preferences
      await this.updatePreferencesFromFeedback(feedback);

      // Log the feedback event
      await this.logCommunication({
        logType: 'user_action',
        serviceName: 'feedback_loop',
        direction: 'inbound',
        content: `User provided ${feedbackType} feedback (strength: ${feedbackStrength})`,
        sessionId,
        conversationId,
        userId,
        status: 'processed',
        workflowStage: 'feedback_received',
        metadata: { feedbackId: feedback.id }
      });

      return feedback;
    } catch (error) {
      console.error('Error recording feedback:', error);
      throw error;
    }
  }

  /**
   * Update user preferences based on feedback patterns
   */
  async updatePreferencesFromFeedback(feedback) {
    try {
      // Infer preferences from positive feedback
      if (feedback.feedback_type === 'positive' && feedback.feedback_strength >= 4) {
        const preferences = [];

        // Response style preference
        if (feedback.template_style) {
          preferences.push({
            category: 'response_style',
            key: 'preferred_template',
            value: feedback.template_style,
            source: 'inferred',
            confidence: feedback.feedback_strength / 5.0
          });
        }

        // Model preference
        if (feedback.model_used) {
          preferences.push({
            category: 'model_behavior',
            key: 'preferred_model',
            value: feedback.model_used,
            source: 'inferred',
            confidence: feedback.feedback_strength / 5.0
          });
        }

        // Response length preference
        if (feedback.response_length) {
          const lengthCategory = 
            feedback.response_length < 500 ? 'concise' :
            feedback.response_length < 1500 ? 'moderate' : 'detailed';
          
          preferences.push({
            category: 'response_style',
            key: 'preferred_length',
            value: lengthCategory,
            source: 'inferred',
            confidence: feedback.feedback_strength / 5.0
          });
        }

        // Store all inferred preferences
        for (const pref of preferences) {
          await this.upsertPreference({
            sessionId: feedback.session_id,
            userId: feedback.user_id,
            category: pref.category,
            key: pref.key,
            value: pref.value,
            source: pref.source,
            confidenceScore: pref.confidence,
            sourceFeedbackId: feedback.id
          });
        }
      }

      // Handle negative feedback by reducing confidence in current preferences
      if (feedback.feedback_type === 'negative' && feedback.feedback_strength >= 4) {
        await this.adjustPreferenceConfidence(
          feedback.session_id,
          feedback.user_id,
          -0.1 // Reduce confidence by 10%
        );
      }
    } catch (error) {
      console.error('Error updating preferences from feedback:', error);
    }
  }

  /**
   * Upsert a user preference
   */
  async upsertPreference({
    userId = null,
    sessionId,
    category,
    key,
    value,
    source = 'explicit',
    priority = 5,
    confidenceScore = 0.8,
    sourceFeedbackId = null,
    sourceAbTestId = null,
    expiresAt = null,
    metadata = {}
  }) {
    try {
      const result = await this.db.query(
        `INSERT INTO user_preferences (
          user_id, session_id, preference_category, preference_key,
          preference_value, preference_source, priority, confidence_score,
          source_feedback_id, source_ab_test_id, expires_at, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (user_id, session_id, preference_category, preference_key)
        DO UPDATE SET
          preference_value = EXCLUDED.preference_value,
          confidence_score = GREATEST(user_preferences.confidence_score, EXCLUDED.confidence_score),
          updated_at = CURRENT_TIMESTAMP,
          metadata = user_preferences.metadata || EXCLUDED.metadata
        RETURNING *`,
        [
          userId, sessionId, category, key, value, source,
          priority, confidenceScore, sourceFeedbackId, sourceAbTestId,
          expiresAt, JSON.stringify(metadata)
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error upserting preference:', error);
      throw error;
    }
  }

  /**
   * Adjust preference confidence scores
   */
  async adjustPreferenceConfidence(sessionId, userId, adjustment) {
    try {
      await this.db.query(
        `UPDATE user_preferences
        SET confidence_score = GREATEST(0.0, LEAST(1.0, confidence_score + $1)),
            updated_at = CURRENT_TIMESTAMP
        WHERE (session_id = $2 OR user_id = $3)
          AND is_active = true`,
        [adjustment, sessionId, userId]
      );
    } catch (error) {
      console.error('Error adjusting preference confidence:', error);
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(sessionId, userId = null, category = null) {
    try {
      let query = `
        SELECT * FROM user_preferences
        WHERE (session_id = $1 OR user_id = $2)
          AND is_active = true
      `;
      const params = [sessionId, userId];

      if (category) {
        query += ` AND preference_category = $3`;
        params.push(category);
      }

      query += ` ORDER BY priority DESC, confidence_score DESC`;

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return [];
    }
  }

  /**
   * Create an A/B test campaign
   */
  async createAbTestCampaign({
    campaignName,
    campaignDescription = null,
    testType,
    variantA,
    variantB,
    variantC = null,
    trafficAllocation = { a: 50, b: 50 },
    minimumSampleSize = 100,
    confidenceThreshold = 0.95,
    createdBy = null,
    metadata = {}
  }) {
    try {
      const result = await this.db.query(
        `INSERT INTO ab_test_campaigns (
          campaign_name, campaign_description, test_type,
          variant_a, variant_b, variant_c, traffic_allocation,
          minimum_sample_size, confidence_threshold, created_by, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          campaignName, campaignDescription, testType,
          JSON.stringify(variantA), JSON.stringify(variantB),
          variantC ? JSON.stringify(variantC) : null,
          JSON.stringify(trafficAllocation),
          minimumSampleSize, confidenceThreshold, createdBy,
          JSON.stringify(metadata)
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating A/B test campaign:', error);
      throw error;
    }
  }

  /**
   * Start an A/B test campaign
   */
  async startAbTestCampaign(campaignId) {
    try {
      const result = await this.db.query(
        `UPDATE ab_test_campaigns
        SET status = 'active', started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *`,
        [campaignId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error starting A/B test campaign:', error);
      throw error;
    }
  }

  /**
   * Assign user to A/B test variant
   */
  async assignToAbTest(campaignId, sessionId, userId = null) {
    try {
      // Get campaign details
      const campaignResult = await this.db.query(
        `SELECT * FROM ab_test_campaigns WHERE id = $1 AND status = 'active'`,
        [campaignId]
      );

      if (campaignResult.rows.length === 0) {
        throw new Error('Campaign not found or not active');
      }

      const campaign = campaignResult.rows[0];
      const allocation = campaign.traffic_allocation;

      // Randomly assign variant based on traffic allocation
      const random = Math.random() * 100;
      let assignedVariant = 'a';
      let cumulative = 0;

      for (const [variant, percentage] of Object.entries(allocation)) {
        cumulative += percentage;
        if (random <= cumulative) {
          assignedVariant = variant;
          break;
        }
      }

      // Store assignment
      const result = await this.db.query(
        `INSERT INTO ab_test_assignments (
          campaign_id, user_id, session_id, assigned_variant
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (campaign_id, session_id)
        DO UPDATE SET updated_at = CURRENT_TIMESTAMP
        RETURNING *`,
        [campaignId, userId, sessionId, assignedVariant]
      );

      const assignment = result.rows[0];

      // Log assignment
      await this.logCommunication({
        logType: 'system_message',
        serviceName: 'ab_test',
        direction: 'internal',
        content: `Assigned to A/B test variant ${assignedVariant} for campaign ${campaign.campaign_name}`,
        sessionId,
        userId,
        status: 'active',
        workflowStage: 'variant_assigned',
        metadata: { campaignId, assignmentId: assignment.id, variant: assignedVariant }
      });

      return {
        assignment,
        variant: campaign[`variant_${assignedVariant}`]
      };
    } catch (error) {
      console.error('Error assigning to A/B test:', error);
      throw error;
    }
  }

  /**
   * Record A/B test interaction
   */
  async recordAbTestInteraction(campaignId, sessionId, feedbackType = null) {
    try {
      const updates = ['interactions_count = interactions_count + 1'];
      const params = [campaignId, sessionId];

      if (feedbackType === 'positive') {
        updates.push('positive_feedbacks = positive_feedbacks + 1');
        updates.push('feedback_provided = true');
      } else if (feedbackType === 'negative') {
        updates.push('negative_feedbacks = negative_feedbacks + 1');
        updates.push('feedback_provided = true');
      }

      await this.db.query(
        `UPDATE ab_test_assignments
        SET ${updates.join(', ')}
        WHERE campaign_id = $1 AND session_id = $2`,
        params
      );
    } catch (error) {
      console.error('Error recording A/B test interaction:', error);
    }
  }

  /**
   * Add A/B test question
   */
  async addAbTestQuestion({
    campaignId,
    questionText,
    questionType, // 'preference', 'comparison', 'rating', 'open_ended'
    options = null,
    showAfterInteractions = 5,
    showProbability = 1.0,
    metadata = {}
  }) {
    try {
      const result = await this.db.query(
        `INSERT INTO ab_test_questions (
          campaign_id, question_text, question_type, options,
          show_after_interactions, show_probability, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          campaignId, questionText, questionType,
          options ? JSON.stringify(options) : null,
          showAfterInteractions, showProbability,
          JSON.stringify(metadata)
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error adding A/B test question:', error);
      throw error;
    }
  }

  /**
   * Get A/B test questions to show user
   */
  async getAbTestQuestions(campaignId, sessionId) {
    try {
      // Get assignment and interaction count
      const assignmentResult = await this.db.query(
        `SELECT * FROM ab_test_assignments
        WHERE campaign_id = $1 AND session_id = $2`,
        [campaignId, sessionId]
      );

      if (assignmentResult.rows.length === 0) {
        return [];
      }

      const assignment = assignmentResult.rows[0];

      // Get questions user should see
      const questionsResult = await this.db.query(
        `SELECT q.* FROM ab_test_questions q
        LEFT JOIN ab_test_responses r ON r.question_id = q.id AND r.assignment_id = $1
        WHERE q.campaign_id = $2
          AND q.is_active = true
          AND q.show_after_interactions <= $3
          AND r.id IS NULL
          AND RANDOM() <= q.show_probability
        ORDER BY q.show_after_interactions
        LIMIT 1`,
        [assignment.id, campaignId, assignment.interactions_count]
      );

      return questionsResult.rows;
    } catch (error) {
      console.error('Error getting A/B test questions:', error);
      return [];
    }
  }

  /**
   * Record A/B test question response
   */
  async recordAbTestResponse({
    questionId,
    assignmentId,
    campaignId,
    responseValue,
    responseVariant = null,
    interactionCount,
    shownAt,
    responseTimeMs = null,
    metadata = {}
  }) {
    try {
      const result = await this.db.query(
        `INSERT INTO ab_test_responses (
          question_id, assignment_id, campaign_id, response_value,
          response_variant, response_time_ms, interaction_count_at_response,
          shown_at, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          questionId, assignmentId, campaignId, responseValue,
          responseVariant, responseTimeMs, interactionCount,
          shownAt, JSON.stringify(metadata)
        ]
      );

      // Mark preference expressed
      await this.db.query(
        `UPDATE ab_test_assignments
        SET preference_expressed = true
        WHERE id = $1`,
        [assignmentId]
      );

      // If user expressed a preference, update user preferences
      if (responseVariant) {
        // Get the campaign to extract variant details
        const campaignResult = await this.db.query(
          `SELECT * FROM ab_test_campaigns WHERE id = $1`,
          [campaignId]
        );

        if (campaignResult.rows.length > 0) {
          const campaign = campaignResult.rows[0];
          const preferredVariant = campaign[`variant_${responseVariant}`];

          // Store as explicit preference
          const assignmentResult = await this.db.query(
            `SELECT session_id, user_id FROM ab_test_assignments WHERE id = $1`,
            [assignmentId]
          );

          const assignment = assignmentResult.rows[0];

          // Extract preference data from variant
          for (const [key, value] of Object.entries(preferredVariant)) {
            await this.upsertPreference({
              sessionId: assignment.session_id,
              userId: assignment.user_id,
              category: campaign.test_type,
              key,
              value: String(value),
              source: 'ab_test',
              priority: 8,
              confidenceScore: 0.9,
              sourceAbTestId: campaignId,
              metadata: { responseId: result.rows[0].id }
            });
          }
        }
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error recording A/B test response:', error);
      throw error;
    }
  }

  /**
   * Get A/B test performance
   */
  async getAbTestPerformance(campaignId) {
    try {
      const result = await this.db.query(
        `SELECT * FROM ab_test_performance WHERE campaign_id = $1`,
        [campaignId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting A/B test performance:', error);
      return [];
    }
  }

  /**
   * Complete A/B test and determine winner
   */
  async completeAbTest(campaignId) {
    try {
      const performance = await this.getAbTestPerformance(campaignId);

      if (performance.length === 0) {
        throw new Error('No performance data available');
      }

      // Simple winner determination based on positive rate
      const winner = performance.reduce((best, current) => 
        current.positive_rate > best.positive_rate ? current : best
      );

      // Calculate statistical significance (simplified)
      const significance = this.calculateStatisticalSignificance(performance);

      await this.db.query(
        `UPDATE ab_test_campaigns
        SET status = 'completed',
            ended_at = CURRENT_TIMESTAMP,
            winning_variant = $1,
            statistical_significance = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *`,
        [winner.assigned_variant, significance, campaignId]
      );

      // Apply winning variant preferences globally
      await this.applyWinningVariant(campaignId, winner.assigned_variant);

      return { winner, significance };
    } catch (error) {
      console.error('Error completing A/B test:', error);
      throw error;
    }
  }

  /**
   * Apply winning variant as default preference
   */
  async applyWinningVariant(campaignId, winningVariant) {
    try {
      // Get campaign details
      const result = await this.db.query(
        `SELECT * FROM ab_test_campaigns WHERE id = $1`,
        [campaignId]
      );

      if (result.rows.length === 0) return;

      const campaign = result.rows[0];
      const variant = campaign[`variant_${winningVariant}`];

      // Store as a learned interaction pattern
      await this.db.query(
        `INSERT INTO model_interaction_patterns (
          pattern_name, pattern_category, trigger_conditions,
          response_modifications, learned_from_campaign_id, is_active
        ) VALUES ($1, $2, $3, $4, $5, true)`,
        [
          `${campaign.campaign_name}_winner`,
          campaign.test_type,
          JSON.stringify({ source: 'ab_test', campaign_id: campaignId }),
          JSON.stringify(variant),
          campaignId
        ]
      );
    } catch (error) {
      console.error('Error applying winning variant:', error);
    }
  }

  /**
   * Calculate statistical significance (simplified chi-square test)
   */
  calculateStatisticalSignificance(performance) {
    // Simplified calculation - in production, use proper statistical library
    if (performance.length < 2) return 0;

    const variantA = performance.find(p => p.assigned_variant === 'a');
    const variantB = performance.find(p => p.assigned_variant === 'b');

    if (!variantA || !variantB) return 0;

    const rateA = variantA.positive_rate || 0;
    const rateB = variantB.positive_rate || 0;
    const countA = variantA.participants || 1;
    const countB = variantB.participants || 1;

    // Calculate pooled standard error
    const pooledRate = (rateA * countA + rateB * countB) / (countA + countB);
    const se = Math.sqrt(pooledRate * (1 - pooledRate) * (1/countA + 1/countB));

    if (se === 0) return 0;

    // Calculate z-score
    const zScore = Math.abs(rateA - rateB) / se;

    // Convert to p-value (approximate)
    const pValue = 1 - (0.5 * (1 + Math.erf(zScore / Math.sqrt(2))));

    return 1 - pValue; // Return confidence level
  }

  /**
   * Log communication event
   */
  async logCommunication({
    logType,
    serviceName,
    direction = 'internal',
    content,
    contentType = 'text',
    sessionId = null,
    conversationId = null,
    userId = null,
    requestId = null,
    status = 'active',
    workflowStage = null,
    processingTimeMs = null,
    tokenCount = null,
    modelUsed = null,
    errorCode = null,
    errorMessage = null,
    parentLogId = null,
    metadata = {}
  }) {
    try {
      const result = await this.db.query(
        `INSERT INTO communication_logs (
          log_type, service_name, direction, content, content_type,
          session_id, conversation_id, user_id, request_id,
          status, workflow_stage, processing_time_ms, token_count,
          model_used, error_code, error_message, parent_log_id, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *`,
        [
          logType, serviceName, direction, content, contentType,
          sessionId, conversationId, userId, requestId,
          status, workflowStage, processingTimeMs, tokenCount,
          modelUsed, errorCode, errorMessage, parentLogId,
          JSON.stringify(metadata)
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error logging communication:', error);
      // Don't throw - logging failures shouldn't break the main flow
    }
  }

  /**
   * Get communication logs
   */
  async getCommunicationLogs(filters = {}) {
    try {
      let query = 'SELECT * FROM communication_logs WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (filters.sessionId) {
        query += ` AND session_id = $${paramCount++}`;
        params.push(filters.sessionId);
      }

      if (filters.conversationId) {
        query += ` AND conversation_id = $${paramCount++}`;
        params.push(filters.conversationId);
      }

      if (filters.serviceName) {
        query += ` AND service_name = $${paramCount++}`;
        params.push(filters.serviceName);
      }

      if (filters.logType) {
        query += ` AND log_type = $${paramCount++}`;
        params.push(filters.logType);
      }

      if (filters.status) {
        query += ` AND status = $${paramCount++}`;
        params.push(filters.status);
      }

      query += ' ORDER BY created_at DESC LIMIT 100';

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting communication logs:', error);
      return [];
    }
  }

  /**
   * Update workflow state
   */
  async updateWorkflowState({
    workflowName,
    workflowType,
    entityId,
    currentState,
    previousState = null,
    stateData = {},
    sessionId = null,
    userId = null,
    parentWorkflowId = null,
    expectedExitAt = null,
    metadata = {}
  }) {
    try {
      // Get previous state if exists
      if (!previousState) {
        const prevResult = await this.db.query(
          `SELECT current_state FROM workflow_states
          WHERE workflow_type = $1 AND entity_id = $2
          ORDER BY entered_state_at DESC LIMIT 1`,
          [workflowType, entityId]
        );

        if (prevResult.rows.length > 0) {
          previousState = prevResult.rows[0].current_state;
        }
      }

      const result = await this.db.query(
        `INSERT INTO workflow_states (
          workflow_name, workflow_type, entity_id, current_state,
          previous_state, state_data, session_id, user_id,
          parent_workflow_id, expected_exit_at, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          workflowName, workflowType, entityId, currentState,
          previousState, JSON.stringify(stateData), sessionId, userId,
          parentWorkflowId, expectedExitAt, JSON.stringify(metadata)
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating workflow state:', error);
      throw error;
    }
  }

  /**
   * Get current workflow state
   */
  async getCurrentWorkflowState(workflowType, entityId) {
    try {
      const result = await this.db.query(
        `SELECT * FROM workflow_states
        WHERE workflow_type = $1 AND entity_id = $2
        ORDER BY entered_state_at DESC LIMIT 1`,
        [workflowType, entityId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting workflow state:', error);
      return null;
    }
  }

  /**
   * Get feedback summary
   */
  async getFeedbackSummary(filters = {}) {
    try {
      let query = 'SELECT * FROM feedback_summary WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (filters.modelUsed) {
        query += ` AND model_used = $${paramCount++}`;
        params.push(filters.modelUsed);
      }

      if (filters.templateStyle) {
        query += ` AND template_style = $${paramCount++}`;
        params.push(filters.templateStyle);
      }

      if (filters.feedbackType) {
        query += ` AND feedback_type = $${paramCount++}`;
        params.push(filters.feedbackType);
      }

      query += ' ORDER BY feedback_date DESC, feedback_count DESC LIMIT 50';

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting feedback summary:', error);
      return [];
    }
  }

  /**
   * Generate session ID
   */
  static generateSessionId() {
    return randomBytes(16).toString('hex');
  }

  /**
   * Generate conversation ID
   */
  static generateConversationId() {
    return `conv_${Date.now()}_${randomBytes(8).toString('hex')}`;
  }

  /**
   * Generate message ID
   */
  static generateMessageId() {
    return `msg_${Date.now()}_${randomBytes(8).toString('hex')}`;
  }
}

export default FeedbackLoopService;
