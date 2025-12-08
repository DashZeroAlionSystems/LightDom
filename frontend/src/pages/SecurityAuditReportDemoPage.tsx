import React from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { AlertTriangle, Shield, ShieldCheck, ShieldOff, ShieldQuestion } from 'lucide-react';

const severityVariant: Record<'critical' | 'high' | 'medium' | 'low', 'error' | 'warning' | 'secondary' | 'success'> = {
  critical: 'error',
  high: 'warning',
  medium: 'secondary',
  low: 'success',
};

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface Vulnerability {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  description: string;
  recommendation: string;
  location: string;
  evidence?: string;
}

interface AuditSummary {
  generatedAt: string;
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const ICON_BY_RISK: Record<AuditSummary['riskLevel'], React.ReactNode> = {
  low: <ShieldCheck className='h-10 w-10 text-success' />,
  medium: <Shield className='h-10 w-10 text-warning' />,
  high: <AlertTriangle className='h-10 w-10 text-error' />,
  critical: <ShieldOff className='h-10 w-10 text-error' />,
};

const SecurityAuditReportDemoPage: React.FC = () => {
  const summary: AuditSummary = {
    generatedAt: '2025/10/31 • 18:17:45',
    score: 85,
    riskLevel: 'medium',
    totalFindings: 1,
    critical: 0,
    high: 1,
    medium: 0,
    low: 0,
  };

  const recommendations: Recommendation[] = [
    {
      id: 'weak-password-policy',
      title: 'Hardening environment credentials',
      description: 'weak_password (1 occurrence) detected in environment variables. Rotate and enforce complex policies.',
      priority: 'high',
    },
  ];

  const vulnerabilities: Vulnerability[] = [
    {
      id: 'env-weak-password',
      title: 'Weak password in environment configuration',
      severity: 'high',
      type: 'weak_password',
      description: 'Environment variable contains a weak password that does not meet platform policies.',
      recommendation: 'Rotate credentials immediately. Require at least 12 characters, mixed case, numbers, and symbols.',
      location: 'Platform environment variables',
      evidence: 'ENV["LEGACY_ADMIN_PASS"] = "password123"',
    },
  ];

  const renderRiskBadge = (level: AuditSummary['riskLevel']) => {
    const label = `${level.charAt(0).toUpperCase()}${level.slice(1)} risk`;
    const variant = level === 'critical' ? 'error' : level === 'high' ? 'warning' : level === 'medium' ? 'secondary' : 'success';
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className='space-y-6 p-6'>
      <header className='flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-outline/10 bg-surface-container-high p-6 shadow-level-1'>
        <div className='space-y-3'>
          <div className='inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary'>
            <ShieldQuestion className='h-4 w-4' />
            Security audit showcase
          </div>
          <div>
            <h1 className='text-3xl font-semibold text-on-surface md:text-4xl'>Security posture report</h1>
            <p className='mt-2 max-w-3xl text-sm text-on-surface-variant'>
              Convert static audit outputs into a reusable MD3 page. Demonstrates how compliance teams can review findings, prioritise remediation, and rerun audits directly inside LightDom.
            </p>
          </div>
        </div>
        <div className='flex flex-col items-end gap-3'>
          <div className='flex items-center gap-3 rounded-2xl border border-outline/15 bg-surface-container-low px-4 py-3'>
            {ICON_BY_RISK[summary.riskLevel]}
            <div>
              <p className='text-sm font-semibold text-on-surface'>Security score</p>
              <p className='text-2xl font-semibold text-on-surface'>{summary.score}/100</p>
              <div className='mt-1'>{renderRiskBadge(summary.riskLevel)}</div>
            </div>
          </div>
          <Button variant='filled'>Run latest audit</Button>
          <p className='text-xs text-on-surface-variant/80'>Last generated: {summary.generatedAt}</p>
        </div>
      </header>

      <section className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader className='space-y-1'>
            <CardTitle className='md3-title-small text-on-surface'>Total findings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-semibold text-on-surface'>{summary.totalFindings}</p>
            <p className='text-sm text-on-surface-variant/80'>Tracked across all environments</p>
          </CardContent>
        </Card>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader className='space-y-1'>
            <CardTitle className='md3-title-small text-on-surface'>Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-semibold text-on-surface'>{summary.critical}</p>
            <Badge variant='success'>Stable</Badge>
          </CardContent>
        </Card>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader className='space-y-1'>
            <CardTitle className='md3-title-small text-on-surface'>High severity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-semibold text-on-surface'>{summary.high}</p>
            <Badge variant='warning'>Action required</Badge>
          </CardContent>
        </Card>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader className='space-y-1'>
            <CardTitle className='md3-title-small text-on-surface'>Medium / low</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-semibold text-on-surface'>{summary.medium + summary.low}</p>
            <p className='text-sm text-on-surface-variant/80'>Monitor upcoming audits</p>
          </CardContent>
        </Card>
      </section>

      <section className='grid gap-4 lg:grid-cols-[1.2fr,0.8fr]'>
        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='text-on-surface'>Vulnerabilities</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {vulnerabilities.map((vulnerability) => (
              <div key={vulnerability.id} className='space-y-3 rounded-2xl border border-outline/15 bg-surface-container-low p-4'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div>
                    <p className='md3-title-small text-on-surface'>{vulnerability.title}</p>
                    <p className='text-xs text-on-surface-variant/70'>{vulnerability.type}</p>
                  </div>
                  <Badge variant={severityVariant[vulnerability.severity]}>{vulnerability.severity.toUpperCase()}</Badge>
                </div>
                <p className='text-sm text-on-surface-variant'>{vulnerability.description}</p>
                <div className='rounded-xl border border-outline/10 bg-surface p-3 text-sm text-on-surface-variant'>
                  <span className='font-medium text-on-surface'>Recommendation:</span> {vulnerability.recommendation}
                </div>
                <div className='flex flex-wrap items-center gap-2 text-xs text-on-surface-variant/80'>
                  <span className='rounded-full bg-outline/10 px-3 py-1'>Location · {vulnerability.location}</span>
                  {vulnerability.evidence && (
                    <span className='rounded-full bg-outline/10 px-3 py-1'>Evidence captured</span>
                  )}
                </div>
                {vulnerability.evidence && (
                  <pre className='mt-3 max-h-40 overflow-auto rounded-xl bg-surface-container p-3 text-xs text-on-surface-variant'>{vulnerability.evidence}</pre>
                )}
              </div>
            ))}
            {vulnerabilities.length === 0 && (
              <p className='text-sm text-on-surface-variant/70'>No active vulnerabilities detected.</p>
            )}
          </CardContent>
        </Card>

        <Card className='border-outline/15 bg-surface'>
          <CardHeader>
            <CardTitle className='text-on-surface'>Top recommendations</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className='rounded-2xl border border-outline/15 bg-surface-container-low p-4'>
                <div className='flex items-center justify-between gap-2'>
                  <p className='md3-title-small text-on-surface'>{recommendation.title}</p>
                  <Badge variant={severityVariant[recommendation.priority]}>{recommendation.priority.toUpperCase()}</Badge>
                </div>
                <p className='mt-2 text-sm text-on-surface-variant'>{recommendation.description}</p>
              </div>
            ))}
            {recommendations.length === 0 && (
              <p className='text-sm text-on-surface-variant/70'>No recommendations pending.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default SecurityAuditReportDemoPage;
