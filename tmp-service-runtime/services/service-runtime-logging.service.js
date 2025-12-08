"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRuntimeLoggingService = void 0;
/**
 * ServiceRuntimeLoggingService
 *
 * Persists runtime session data for backend services including:
 * - Runtime profiles (per environment/model configuration)
 * - Service sessions (start/stop + metadata)
 * - Session events, stream payloads, and metrics
 */
var ServiceRuntimeLoggingService = /** @class */ (function () {
    function ServiceRuntimeLoggingService(db) {
        this.db = db;
    }
    /**
     * Create a new runtime profile for a service.
     */
    ServiceRuntimeLoggingService.prototype.createRuntimeProfile = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.runInTransaction(function (client) { return __awaiter(_this, void 0, void 0, function () {
                        var result;
                        var _a, _b, _c, _d, _e, _f;
                        return __generator(this, function (_g) {
                            switch (_g.label) {
                                case 0:
                                    if (!input.isDefault) return [3 /*break*/, 2];
                                    return [4 /*yield*/, client.query('UPDATE service_runtime_profiles SET is_default = false WHERE service_id = $1', [input.serviceId])];
                                case 1:
                                    _g.sent();
                                    _g.label = 2;
                                case 2: return [4 /*yield*/, client.query("INSERT INTO service_runtime_profiles (\n           service_id, profile_key, name, description, environment, base_url,\n           auth_strategy, default_model, configuration, limits, is_default\n         ) VALUES ($1, $2, $3, $4, COALESCE($5, 'development'), $6, $7, $8, $9::jsonb, $10::jsonb, COALESCE($11, false))\n         RETURNING *", [
                                        input.serviceId,
                                        input.profileKey,
                                        input.name,
                                        (_a = input.description) !== null && _a !== void 0 ? _a : null,
                                        (_b = input.environment) !== null && _b !== void 0 ? _b : 'development',
                                        (_c = input.baseUrl) !== null && _c !== void 0 ? _c : null,
                                        (_d = input.authStrategy) !== null && _d !== void 0 ? _d : null,
                                        (_e = input.defaultModel) !== null && _e !== void 0 ? _e : null,
                                        this.toJsonString(input.configuration),
                                        this.toJsonString(input.limits),
                                        (_f = input.isDefault) !== null && _f !== void 0 ? _f : false
                                    ])];
                                case 3:
                                    result = _g.sent();
                                    return [2 /*return*/, this.mapProfile(result.rows[0])];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Update a runtime profile.
     */
    ServiceRuntimeLoggingService.prototype.updateRuntimeProfile = function (profileId, patch) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.runInTransaction(function (client) { return __awaiter(_this, void 0, void 0, function () {
                        var rows, fields, values, rows, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(patch.isDefault === true)) return [3 /*break*/, 3];
                                    return [4 /*yield*/, client.query('SELECT service_id FROM service_runtime_profiles WHERE profile_id = $1', [profileId])];
                                case 1:
                                    rows = (_a.sent()).rows;
                                    if (!rows[0]) return [3 /*break*/, 3];
                                    return [4 /*yield*/, client.query('UPDATE service_runtime_profiles SET is_default = false WHERE service_id = $1', [rows[0].service_id])];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3:
                                    fields = [];
                                    values = [];
                                    if (patch.name !== undefined) {
                                        fields.push("name = $".concat(fields.length + 1));
                                        values.push(patch.name);
                                    }
                                    if (patch.description !== undefined) {
                                        fields.push("description = $".concat(fields.length + 1));
                                        values.push(patch.description);
                                    }
                                    if (patch.environment !== undefined) {
                                        fields.push("environment = $".concat(fields.length + 1));
                                        values.push(patch.environment);
                                    }
                                    if (patch.baseUrl !== undefined) {
                                        fields.push("base_url = $".concat(fields.length + 1));
                                        values.push(patch.baseUrl);
                                    }
                                    if (patch.authStrategy !== undefined) {
                                        fields.push("auth_strategy = $".concat(fields.length + 1));
                                        values.push(patch.authStrategy);
                                    }
                                    if (patch.defaultModel !== undefined) {
                                        fields.push("default_model = $".concat(fields.length + 1));
                                        values.push(patch.defaultModel);
                                    }
                                    if (patch.configuration !== undefined) {
                                        fields.push("configuration = $".concat(fields.length + 1, "::jsonb"));
                                        values.push(this.toJsonString(patch.configuration));
                                    }
                                    if (patch.limits !== undefined) {
                                        fields.push("limits = $".concat(fields.length + 1, "::jsonb"));
                                        values.push(this.toJsonString(patch.limits));
                                    }
                                    if (patch.isDefault !== undefined) {
                                        fields.push("is_default = $".concat(fields.length + 1));
                                        values.push(patch.isDefault);
                                    }
                                    if (!(fields.length === 0)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, client.query('SELECT * FROM service_runtime_profiles WHERE profile_id = $1', [profileId])];
                                case 4:
                                    rows = (_a.sent()).rows;
                                    return [2 /*return*/, rows[0] ? this.mapProfile(rows[0]) : null];
                                case 5:
                                    values.push(profileId);
                                    return [4 /*yield*/, client.query("UPDATE service_runtime_profiles\n         SET ".concat(fields.join(', '), ", updated_at = CURRENT_TIMESTAMP\n         WHERE profile_id = $").concat(values.length, "\n         RETURNING *"), values)];
                                case 6:
                                    result = _a.sent();
                                    return [2 /*return*/, result.rows[0] ? this.mapProfile(result.rows[0]) : null];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Fetch a runtime profile by ID.
     */
    ServiceRuntimeLoggingService.prototype.getRuntimeProfile = function (profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query('SELECT * FROM service_runtime_profiles WHERE profile_id = $1', [profileId])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows[0] ? this.mapProfile(result.rows[0]) : null];
                }
            });
        });
    };
    /**
     * List runtime profiles with optional filtering.
     */
    ServiceRuntimeLoggingService.prototype.listRuntimeProfiles = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var conditions, values, whereClause, limit, result;
            var _this = this;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conditions = [];
                        values = [];
                        if (filters.serviceId) {
                            conditions.push("service_id = $".concat(values.length + 1));
                            values.push(filters.serviceId);
                        }
                        if (filters.environment) {
                            conditions.push("environment = $".concat(values.length + 1));
                            values.push(filters.environment);
                        }
                        whereClause = conditions.length > 0 ? "WHERE ".concat(conditions.join(' AND ')) : '';
                        limit = filters.limit && filters.limit > 0 ? filters.limit : 50;
                        return [4 /*yield*/, this.db.query("SELECT * FROM service_runtime_profiles ".concat(whereClause, "\n       ORDER BY created_at DESC\n       LIMIT $").concat(values.length + 1), __spreadArray(__spreadArray([], values, true), [limit], false))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.map(function (row) { return _this.mapProfile(row); })];
                }
            });
        });
    };
    /**
     * Create (or ensure) a service stream channel definition.
     */
    ServiceRuntimeLoggingService.prototype.createStreamChannel = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.db.query("INSERT INTO service_stream_channels (\n         service_id, name, description, channel_type, schema_definition,\n         retention_policy, is_active\n       ) VALUES (\n         $1, $2, $3, $4, $5::jsonb, $6::jsonb, COALESCE($7, true)\n       )\n       ON CONFLICT (service_id, name)\n       DO UPDATE SET\n         description = EXCLUDED.description,\n         channel_type = EXCLUDED.channel_type,\n         schema_definition = EXCLUDED.schema_definition,\n         retention_policy = EXCLUDED.retention_policy,\n         is_active = EXCLUDED.is_active,\n         updated_at = CURRENT_TIMESTAMP\n       RETURNING *", [
                            input.serviceId,
                            input.name,
                            (_a = input.description) !== null && _a !== void 0 ? _a : null,
                            input.channelType,
                            this.toJsonString(input.schemaDefinition),
                            this.toJsonString(input.retentionPolicy),
                            (_b = input.isActive) !== null && _b !== void 0 ? _b : true
                        ])];
                    case 1:
                        result = _c.sent();
                        return [2 /*return*/, this.mapChannel(result.rows[0])];
                }
            });
        });
    };
    /**
     * Update a service stream channel.
     */
    ServiceRuntimeLoggingService.prototype.updateStreamChannel = function (channelId, patch) {
        return __awaiter(this, void 0, void 0, function () {
            var fields, values, result_1, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fields = [];
                        values = [];
                        if (patch.name !== undefined) {
                            fields.push("name = $".concat(fields.length + 1));
                            values.push(patch.name);
                        }
                        if (patch.description !== undefined) {
                            fields.push("description = $".concat(fields.length + 1));
                            values.push(patch.description);
                        }
                        if (patch.channelType !== undefined) {
                            fields.push("channel_type = $".concat(fields.length + 1));
                            values.push(patch.channelType);
                        }
                        if (patch.schemaDefinition !== undefined) {
                            fields.push("schema_definition = $".concat(fields.length + 1, "::jsonb"));
                            values.push(this.toJsonString(patch.schemaDefinition));
                        }
                        if (patch.retentionPolicy !== undefined) {
                            fields.push("retention_policy = $".concat(fields.length + 1, "::jsonb"));
                            values.push(this.toJsonString(patch.retentionPolicy));
                        }
                        if (patch.isActive !== undefined) {
                            fields.push("is_active = $".concat(fields.length + 1));
                            values.push(patch.isActive);
                        }
                        if (!(fields.length === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.db.query('SELECT * FROM service_stream_channels WHERE channel_id = $1', [channelId])];
                    case 1:
                        result_1 = _a.sent();
                        return [2 /*return*/, result_1.rows[0] ? this.mapChannel(result_1.rows[0]) : null];
                    case 2:
                        values.push(channelId);
                        return [4 /*yield*/, this.db.query("UPDATE service_stream_channels\n       SET ".concat(fields.join(', '), ", updated_at = CURRENT_TIMESTAMP\n       WHERE channel_id = $").concat(values.length, "\n       RETURNING *"), values)];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result.rows[0] ? this.mapChannel(result.rows[0]) : null];
                }
            });
        });
    };
    /**
     * List channels defined for a service.
     */
    ServiceRuntimeLoggingService.prototype.listStreamChannels = function (serviceId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query("SELECT * FROM service_stream_channels\n       WHERE service_id = $1\n       ORDER BY name ASC", [serviceId])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.map(function (row) { return _this.mapChannel(row); })];
                }
            });
        });
    };
    /**
     * Create a new service session record.
     */
    ServiceRuntimeLoggingService.prototype.createServiceSession = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.db.query("INSERT INTO service_sessions (\n         service_id, profile_id, session_label, status, started_at,\n         runtime_metadata, health_snapshot\n       ) VALUES (\n         $1, $2, $3, COALESCE($4, 'initializing'),\n         COALESCE($5, CURRENT_TIMESTAMP),\n         $6::jsonb, $7::jsonb\n       ) RETURNING *", [
                            input.serviceId,
                            (_a = input.profileId) !== null && _a !== void 0 ? _a : null,
                            (_b = input.sessionLabel) !== null && _b !== void 0 ? _b : null,
                            (_c = input.status) !== null && _c !== void 0 ? _c : 'initializing',
                            (_d = input.startedAt) !== null && _d !== void 0 ? _d : null,
                            this.toJsonString(input.runtimeMetadata),
                            this.toJsonString(input.healthSnapshot)
                        ])];
                    case 1:
                        result = _e.sent();
                        return [2 /*return*/, this.mapSession(result.rows[0])];
                }
            });
        });
    };
    /**
     * Update an existing service session.
     */
    ServiceRuntimeLoggingService.prototype.updateServiceSession = function (sessionId, patch) {
        return __awaiter(this, void 0, void 0, function () {
            var fields, values, result_2, result, enriched;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fields = [];
                        values = [];
                        if (patch.status !== undefined) {
                            fields.push("status = $".concat(fields.length + 1));
                            values.push(patch.status);
                        }
                        if (patch.endedAt !== undefined) {
                            fields.push("ended_at = $".concat(fields.length + 1));
                            values.push(patch.endedAt);
                        }
                        if (patch.runtimeMetadata !== undefined) {
                            fields.push("runtime_metadata = $".concat(fields.length + 1, "::jsonb"));
                            values.push(this.toJsonString(patch.runtimeMetadata));
                        }
                        if (patch.healthSnapshot !== undefined) {
                            fields.push("health_snapshot = $".concat(fields.length + 1, "::jsonb"));
                            values.push(this.toJsonString(patch.healthSnapshot));
                        }
                        if (patch.errorSummary !== undefined) {
                            fields.push("error_summary = $".concat(fields.length + 1));
                            values.push(patch.errorSummary);
                        }
                        if (!(fields.length === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.db.query("SELECT ss.*, srp.name AS profile_name, srp.profile_key, srp.environment AS profile_environment\n         FROM service_sessions ss\n         LEFT JOIN service_runtime_profiles srp ON ss.profile_id = srp.profile_id\n         WHERE service_session_id = $1", [sessionId])];
                    case 1:
                        result_2 = _a.sent();
                        return [2 /*return*/, result_2.rows[0] ? this.mapSession(result_2.rows[0]) : null];
                    case 2:
                        values.push(sessionId);
                        return [4 /*yield*/, this.db.query("UPDATE service_sessions\n       SET ".concat(fields.join(', '), ", updated_at = CURRENT_TIMESTAMP\n       WHERE service_session_id = $").concat(values.length, "\n       RETURNING *"), values)];
                    case 3:
                        result = _a.sent();
                        if (!result.rows[0]) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.db.query("SELECT ss.*, srp.name AS profile_name, srp.profile_key, srp.environment AS profile_environment\n       FROM service_sessions ss\n       LEFT JOIN service_runtime_profiles srp ON ss.profile_id = srp.profile_id\n       WHERE ss.service_session_id = $1", [sessionId])];
                    case 4:
                        enriched = _a.sent();
                        return [2 /*return*/, enriched.rows[0] ? this.mapSession(enriched.rows[0]) : null];
                }
            });
        });
    };
    /**
     * List service sessions with optional filters.
     */
    ServiceRuntimeLoggingService.prototype.listServiceSessions = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var conditions, values, whereClause, limit, result;
            var _this = this;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conditions = [];
                        values = [];
                        if (filters.serviceId) {
                            conditions.push("ss.service_id = $".concat(values.length + 1));
                            values.push(filters.serviceId);
                        }
                        if (filters.status) {
                            conditions.push("ss.status = $".concat(values.length + 1));
                            values.push(filters.status);
                        }
                        whereClause = conditions.length > 0 ? "WHERE ".concat(conditions.join(' AND ')) : '';
                        limit = filters.limit && filters.limit > 0 ? filters.limit : 50;
                        return [4 /*yield*/, this.db.query("SELECT ss.*, srp.name AS profile_name, srp.profile_key, srp.environment AS profile_environment\n       FROM service_sessions ss\n       LEFT JOIN service_runtime_profiles srp ON ss.profile_id = srp.profile_id\n       ".concat(whereClause, "\n       ORDER BY ss.started_at DESC\n       LIMIT $").concat(values.length + 1), __spreadArray(__spreadArray([], values, true), [limit], false))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.map(function (row) { return _this.mapSession(row); })];
                }
            });
        });
    };
    /**
     * Fetch session details including related records.
     */
    ServiceRuntimeLoggingService.prototype.getServiceSessionDetails = function (sessionId_1) {
        return __awaiter(this, arguments, void 0, function (sessionId, options) {
            var base, detail, eventResult, streamResult, metricResult;
            var _this = this;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query("SELECT ss.*, srp.name AS profile_name, srp.profile_key, srp.environment AS profile_environment\n       FROM service_sessions ss\n       LEFT JOIN service_runtime_profiles srp ON ss.profile_id = srp.profile_id\n       WHERE ss.service_session_id = $1", [sessionId])];
                    case 1:
                        base = _a.sent();
                        if (!base.rows[0]) {
                            return [2 /*return*/, null];
                        }
                        detail = this.mapSession(base.rows[0]);
                        if (!options.includeEvents) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.db.query("SELECT * FROM service_session_events\n         WHERE service_session_id = $1\n         ORDER BY occurred_at DESC\n         LIMIT $2", [sessionId, options.eventLimit && options.eventLimit > 0 ? options.eventLimit : 100])];
                    case 2:
                        eventResult = _a.sent();
                        detail.events = eventResult.rows.map(function (row) { return _this.mapEvent(row); });
                        _a.label = 3;
                    case 3:
                        if (!options.includeStreams) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.db.query("SELECT * FROM service_session_streams\n         WHERE service_session_id = $1\n         ORDER BY captured_at DESC\n         LIMIT $2", [sessionId, options.streamLimit && options.streamLimit > 0 ? options.streamLimit : 100])];
                    case 4:
                        streamResult = _a.sent();
                        detail.streams = streamResult.rows.map(function (row) { return _this.mapStream(row); });
                        _a.label = 5;
                    case 5:
                        if (!options.includeMetrics) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.db.query("SELECT * FROM service_session_metrics\n         WHERE service_session_id = $1\n         ORDER BY recorded_at DESC\n         LIMIT $2", [sessionId, options.metricLimit && options.metricLimit > 0 ? options.metricLimit : 100])];
                    case 6:
                        metricResult = _a.sent();
                        detail.metrics = metricResult.rows.map(function (row) { return _this.mapMetric(row); });
                        _a.label = 7;
                    case 7: return [2 /*return*/, detail];
                }
            });
        });
    };
    /**
     * Log an event for a service session.
     */
    ServiceRuntimeLoggingService.prototype.logServiceSessionEvent = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.db.query("INSERT INTO service_session_events (\n         service_session_id, event_type, event_source, severity, event_payload,\n         occurred_at, metadata\n       ) VALUES (\n         $1, $2, $3, COALESCE($4, 'info'), $5::jsonb,\n         COALESCE($6, CURRENT_TIMESTAMP), $7::jsonb\n       ) RETURNING *", [
                            input.serviceSessionId,
                            input.eventType,
                            (_a = input.eventSource) !== null && _a !== void 0 ? _a : null,
                            (_b = input.severity) !== null && _b !== void 0 ? _b : 'info',
                            this.toJsonString(input.eventPayload),
                            (_c = input.occurredAt) !== null && _c !== void 0 ? _c : null,
                            this.toJsonString(input.metadata)
                        ])];
                    case 1:
                        result = _d.sent();
                        return [2 /*return*/, this.mapEvent(result.rows[0])];
                }
            });
        });
    };
    /**
     * Record a stream payload for a service session.
     */
    ServiceRuntimeLoggingService.prototype.recordServiceSessionStream = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.db.query("WITH next_sequence AS (\n         SELECT COALESCE(MAX(sequence_number), 0) + 1 AS seq\n         FROM service_session_streams\n         WHERE service_session_id = $1 AND channel_id = $2\n       )\n       INSERT INTO service_session_streams (\n         service_session_id, channel_id, sequence_number, payload, status,\n         captured_at, metadata\n       ) VALUES (\n         $1, $2,\n         COALESCE($3, (SELECT seq FROM next_sequence)),\n         $4::jsonb,\n         COALESCE($5, 'captured'),\n         COALESCE($6, CURRENT_TIMESTAMP),\n         $7::jsonb\n       ) RETURNING *", [
                            input.serviceSessionId,
                            input.channelId,
                            (_a = input.sequenceNumber) !== null && _a !== void 0 ? _a : null,
                            this.toJsonString(input.payload),
                            (_b = input.status) !== null && _b !== void 0 ? _b : 'captured',
                            (_c = input.capturedAt) !== null && _c !== void 0 ? _c : null,
                            this.toJsonString(input.metadata)
                        ])];
                    case 1:
                        result = _d.sent();
                        return [2 /*return*/, this.mapStream(result.rows[0])];
                }
            });
        });
    };
    /**
     * Record a metric value for a service session.
     */
    ServiceRuntimeLoggingService.prototype.recordServiceSessionMetric = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.db.query("INSERT INTO service_session_metrics (\n         service_session_id, metric_name, metric_value, unit, recorded_at, metadata\n       ) VALUES (\n         $1, $2, $3, $4, COALESCE($5, CURRENT_TIMESTAMP), $6::jsonb\n       ) RETURNING *", [
                            input.serviceSessionId,
                            input.metricName,
                            input.metricValue,
                            (_a = input.unit) !== null && _a !== void 0 ? _a : null,
                            (_b = input.recordedAt) !== null && _b !== void 0 ? _b : null,
                            this.toJsonString(input.metadata)
                        ])];
                    case 1:
                        result = _c.sent();
                        return [2 /*return*/, this.mapMetric(result.rows[0])];
                }
            });
        });
    };
    ServiceRuntimeLoggingService.prototype.runInTransaction = function (fn) {
        return __awaiter(this, void 0, void 0, function () {
            var client, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, 8, 9]);
                        return [4 /*yield*/, client.query('BEGIN')];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, fn(client)];
                    case 4:
                        result = _a.sent();
                        return [4 /*yield*/, client.query('COMMIT')];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6:
                        error_1 = _a.sent();
                        return [4 /*yield*/, client.query('ROLLBACK')];
                    case 7:
                        _a.sent();
                        throw error_1;
                    case 8:
                        client.release();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    ServiceRuntimeLoggingService.prototype.mapProfile = function (row) {
        return {
            profileId: row.profile_id,
            serviceId: row.service_id,
            profileKey: row.profile_key,
            name: row.name,
            description: row.description,
            environment: row.environment,
            baseUrl: row.base_url,
            authStrategy: row.auth_strategy,
            defaultModel: row.default_model,
            configuration: this.ensureJson(row.configuration),
            limits: this.ensureJson(row.limits),
            isDefault: Boolean(row.is_default),
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    };
    ServiceRuntimeLoggingService.prototype.mapChannel = function (row) {
        return {
            channelId: row.channel_id,
            serviceId: row.service_id,
            name: row.name,
            description: row.description,
            channelType: row.channel_type,
            schemaDefinition: this.ensureJson(row.schema_definition),
            retentionPolicy: this.ensureJson(row.retention_policy),
            isActive: Boolean(row.is_active),
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    };
    ServiceRuntimeLoggingService.prototype.mapSession = function (row) {
        var session = {
            sessionId: row.service_session_id,
            serviceId: row.service_id,
            profileId: row.profile_id,
            sessionLabel: row.session_label,
            status: row.status,
            startedAt: row.started_at,
            endedAt: row.ended_at,
            runtimeMetadata: this.ensureJson(row.runtime_metadata),
            healthSnapshot: this.ensureJson(row.health_snapshot),
            errorSummary: row.error_summary,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        if (row.profile_id) {
            session.profile = {
                profileId: row.profile_id,
                profileKey: row.profile_key,
                name: row.profile_name,
                environment: row.profile_environment
            };
        }
        return session;
    };
    ServiceRuntimeLoggingService.prototype.mapEvent = function (row) {
        return {
            eventId: row.event_id,
            serviceSessionId: row.service_session_id,
            eventType: row.event_type,
            eventSource: row.event_source,
            severity: row.severity,
            eventPayload: this.ensureJson(row.event_payload),
            occurredAt: row.occurred_at,
            metadata: this.ensureJson(row.metadata)
        };
    };
    ServiceRuntimeLoggingService.prototype.mapStream = function (row) {
        return {
            streamRecordId: row.stream_record_id,
            serviceSessionId: row.service_session_id,
            channelId: row.channel_id,
            sequenceNumber: Number(row.sequence_number),
            payload: this.ensureJson(row.payload),
            status: row.status,
            capturedAt: row.captured_at,
            metadata: this.ensureJson(row.metadata)
        };
    };
    ServiceRuntimeLoggingService.prototype.mapMetric = function (row) {
        return {
            metricsId: row.metrics_id,
            serviceSessionId: row.service_session_id,
            metricName: row.metric_name,
            metricValue: Number(row.metric_value),
            unit: row.unit,
            recordedAt: row.recorded_at,
            metadata: this.ensureJson(row.metadata)
        };
    };
    ServiceRuntimeLoggingService.prototype.ensureJson = function (value) {
        if (value === null || value === undefined) {
            return {};
        }
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch (error) {
                return {};
            }
        }
        if (typeof value === 'object') {
            return value;
        }
        return {};
    };
    ServiceRuntimeLoggingService.prototype.toJsonString = function (value, fallback) {
        if (fallback === void 0) { fallback = {}; }
        if (value === undefined || value === null) {
            return JSON.stringify(fallback);
        }
        if (typeof value === 'string') {
            var trimmed = value.trim();
            if (!trimmed) {
                return JSON.stringify(fallback);
            }
            try {
                return JSON.stringify(JSON.parse(trimmed));
            }
            catch (error) {
                return JSON.stringify(fallback);
            }
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
            return JSON.stringify(value);
        }
        return JSON.stringify(value);
    };
    return ServiceRuntimeLoggingService;
}());
exports.ServiceRuntimeLoggingService = ServiceRuntimeLoggingService;
exports.default = ServiceRuntimeLoggingService;
