#!/usr/bin/env node

/**
 * ATLAS MATRIX ORCHESTRATOR
 *
 * Hierarchical multi-agent system with:
 * - Central ATLAS Matrix decision-maker
 * - Specialized agents (Signal, Risk, Execution, Regime, Research, Quality, Meta)
 * - Agent contracts and lifecycle management
 * - Human-in-the-loop governance at escalation points
 * - Immutable evidence ledger with cryptographic integrity
 * - Continuous learning feedback loop
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

// ============================================================================
// AGENT CONTRACTS & SPECIFICATIONS
// ============================================================================

/**
 * Agent Contract - defines scope, capabilities, escalation conditions
 */
class AgentContract {
  constructor(agentId, name, role, capabilities, escalationThresholds) {
    this.agentId = agentId;
    this.name = name;
    this.role = role; // "signal" | "risk" | "execution" | "regime" | "research" | "quality" | "meta"
    this.capabilities = capabilities; // array of action types this agent can perform
    this.escalationThresholds = escalationThresholds; // conditions requiring human approval
    this.status = "initialized";
    this.lastHeartbeat = new Date().toISOString();
  }

  canExecute(actionType) {
    return this.capabilities.includes(actionType);
  }

  requiresEscalation(riskScore, actionType) {
    const threshold = this.escalationThresholds[actionType] || 0.5;
    return riskScore >= threshold;
  }

  async healthCheck() {
    this.lastHeartbeat = new Date().toISOString();
    return { agentId: this.agentId, status: "healthy", lastHeartbeat: this.lastHeartbeat };
  }
}

// ============================================================================
// SPECIALIZED AGENTS
// ============================================================================

/**
 * SIGNAL AGENT
 * Monitors external data sources (Gmail, Stripe, Calendar, Make.com)
 * Collects raw signals and normalizes into structured format
 */
class SignalAgent {
  constructor() {
    this.contract = new AgentContract(
      "signal-01",
      "Signal Monitor",
      "signal",
      ["collect_gmail", "collect_stripe", "collect_calendar", "collect_make"],
      { "collect_gmail": 0.0, "collect_stripe": 0.0, "collect_calendar": 0.0 }
    );
    this.signals = [];
  }

  async gatherSignals(sources) {
    const signals = [];

    // Simulate signal collection from each source
    for (const source of sources) {
      const signal = {
        id: crypto.randomUUID(),
        source: source.type,
        timestamp: new Date().toISOString(),
        data: source.data,
        priority: this.calculatePriority(source),
        normalized: true
      };
      signals.push(signal);
    }

    this.signals = signals;
    return {
      agentId: this.contract.agentId,
      signalCount: signals.length,
      signals: signals
    };
  }

  calculatePriority(source) {
    // Priority based on source type and urgency indicators
    if (source.type === "stripe" && source.data?.amount > 10000) return "critical";
    if (source.type === "gmail" && source.data?.subject?.toLowerCase().includes("alert")) return "high";
    return "normal";
  }
}

/**
 * RISK AGENT
 * Analyzes signals and calculates risk scores
 * Uses Claude AI for intelligent classification
 */
class RiskAgent {
  constructor(anthropicClient) {
    this.contract = new AgentContract(
      "risk-01",
      "Risk Analyzer",
      "risk",
      ["classify_risk", "analyze_pattern", "generate_alert"],
      { "classify_risk": 0.7, "generate_alert": 0.8 }
    );
    this.anthropic = anthropicClient;
    this.patterns = [];
  }

  async analyzeSignals(signals) {
    const analyses = [];

    for (const signal of signals) {
      const analysis = await this.classifyRisk(signal);
      analyses.push(analysis);
    }

    return {
      agentId: this.contract.agentId,
      analysisCount: analyses.length,
      analyses: analyses,
      timestamp: new Date().toISOString()
    };
  }

  async classifyRisk(signal) {
    // Simulate Claude API call (in production, use real anthropic client)
    let riskScore = 0.3; // default
    let classification = "low";
    let reasoning = "";

    // Simple heuristics for now
    if (signal.source === "stripe") {
      if (signal.data?.amount > 10000) {
        riskScore = 0.85;
        classification = "critical";
        reasoning = "Large charge amount exceeds normal threshold";
      } else if (signal.data?.amount > 5000) {
        riskScore = 0.65;
        classification = "high";
        reasoning = "Moderate charge amount detected";
      }
    } else if (signal.source === "gmail") {
      if (signal.data?.subject?.toLowerCase().includes("fraud")) {
        riskScore = 0.95;
        classification = "critical";
        reasoning = "Fraud alert detected in email";
      } else if (signal.data?.subject?.toLowerCase().includes("unusual")) {
        riskScore = 0.75;
        classification = "high";
        reasoning = "Unusual activity notification received";
      }
    }

    return {
      signalId: signal.id,
      source: signal.source,
      riskScore: riskScore,
      classification: classification,
      reasoning: reasoning,
      timestamp: new Date().toISOString(),
      requiresEscalation: this.contract.requiresEscalation(riskScore, "classify_risk")
    };
  }
}

/**
 * EXECUTION AGENT
 * Executes remediation actions based on risk classification
 * Triggers webhooks and Make.com automations
 */
class ExecutionAgent {
  constructor() {
    this.contract = new AgentContract(
      "execution-01",
      "Action Executor",
      "execution",
      ["block_charge", "alert_user", "investigate", "monitor", "webhook_trigger"],
      { "block_charge": 0.8, "alert_user": 0.6, "webhook_trigger": 0.5 }
    );
    this.executedActions = [];
  }

  async executeAction(risk, actionType) {
    if (!this.contract.canExecute(actionType)) {
      return {
        agentId: this.contract.agentId,
        status: "denied",
        reason: `Agent cannot execute action: ${actionType}`
      };
    }

    const action = {
      id: crypto.randomUUID(),
      type: actionType,
      riskScore: risk.riskScore,
      timestamp: new Date().toISOString(),
      requiresHumanApproval: this.contract.requiresEscalation(risk.riskScore, actionType),
      status: "pending"
    };

    if (action.requiresHumanApproval) {
      action.status = "awaiting_approval";
    } else {
      action.status = "executed";
    }

    this.executedActions.push(action);
    return action;
  }

  async triggerWebhook(webhookUrl, data) {
    // Simulate webhook trigger (in production, use actual HTTP call)
    return {
      webhookUrl: webhookUrl,
      status: "triggered",
      timestamp: new Date().toISOString(),
      data: data
    };
  }
}

/**
 * REGIME AGENT
 * Monitors policy compliance and governance rules
 * Ensures actions comply with established regimes
 */
class RegimeAgent {
  constructor() {
    this.contract = new AgentContract(
      "regime-01",
      "Policy Monitor",
      "regime",
      ["validate_policy", "check_compliance", "flag_violation"],
      { "flag_violation": 0.5 }
    );
    this.policies = this.loadPolicies();
  }

  loadPolicies() {
    return {
      maxChargeAmount: 15000,
      dailyChargeLimit: 50000,
      suspiciousPatternsThreshold: 5,
      autoBlockThreshold: 0.9,
      requireApprovalThreshold: 0.7,
      dataRetentionDays: 90
    };
  }

  async validateAction(action, context) {
    const violations = [];

    if (action.type === "block_charge" && context.chargeAmount > this.policies.maxChargeAmount) {
      violations.push("Charge exceeds policy maximum");
    }

    if (context.dailyChargeTotal > this.policies.dailyChargeLimit) {
      violations.push("Daily charge limit would be exceeded");
    }

    return {
      agentId: this.contract.agentId,
      isCompliant: violations.length === 0,
      violations: violations,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * RESEARCH AGENT
 * Investigates anomalies and gathers contextual information
 * Builds intelligence about suspicious patterns
 */
class ResearchAgent {
  constructor() {
    this.contract = new AgentContract(
      "research-01",
      "Intelligence Gatherer",
      "research",
      ["investigate", "correlate_data", "profile_entity", "identify_pattern"],
      { "investigate": 0.5 }
    );
    this.investigations = [];
  }

  async investigate(signal, historicalData = []) {
    const investigation = {
      id: crypto.randomUUID(),
      signalId: signal.id,
      source: signal.source,
      timestamp: new Date().toISOString(),
      findings: {
        isAnomalous: false,
        confidence: 0,
        context: [],
        relatedIncidents: []
      }
    };

    // Analyze current signal against historical pattern
    if (historicalData.length > 0) {
      const avgValue = historicalData.reduce((sum, d) => sum + (d.amount || 0), 0) / historicalData.length;
      const currentValue = signal.data?.amount || 0;

      if (currentValue > avgValue * 2) {
        investigation.findings.isAnomalous = true;
        investigation.findings.confidence = 0.75;
        investigation.findings.context.push(`Value ${(currentValue / avgValue).toFixed(2)}x historical average`);
      }
    }

    this.investigations.push(investigation);
    return investigation;
  }
}

/**
 * QUALITY AGENT
 * Ensures data quality and validates agent outputs
 * Prevents cascading errors through the system
 */
class QualityAgent {
  constructor() {
    this.contract = new AgentContract(
      "quality-01",
      "QA Monitor",
      "quality",
      ["validate_data", "verify_output", "flag_anomaly"],
      { "flag_anomaly": 0.6 }
    );
    this.validationErrors = [];
  }

  async validateAnalysis(analysis) {
    const issues = [];

    if (!analysis.signalId) issues.push("Missing signalId");
    if (typeof analysis.riskScore !== "number" || analysis.riskScore < 0 || analysis.riskScore > 1) {
      issues.push("Invalid riskScore value");
    }
    if (!["low", "medium", "high", "critical"].includes(analysis.classification)) {
      issues.push("Invalid classification");
    }
    if (!analysis.timestamp) issues.push("Missing timestamp");

    return {
      agentId: this.contract.agentId,
      isValid: issues.length === 0,
      issues: issues,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * META-ORCHESTRATOR AGENT
 * Monitors other agents, ensures ecosystem health
 * Coordinates agent contracts and lifecycle
 */
class MetaOrchestratorAgent {
  constructor() {
    this.contract = new AgentContract(
      "meta-01",
      "Meta-Orchestrator",
      "meta",
      ["monitor_agents", "validate_contracts", "coordinate_workflow", "resolve_conflict"],
      { "resolve_conflict": 0.7 }
    );
    this.agentRegistry = new Map();
  }

  registerAgent(agent) {
    this.agentRegistry.set(agent.contract.agentId, {
      agent: agent,
      contract: agent.contract,
      healthStatus: "healthy",
      lastCheck: new Date().toISOString()
    });
  }

  async healthCheck() {
    const results = [];
    for (const [agentId, record] of this.agentRegistry.entries()) {
      const health = await record.agent.contract.healthCheck();
      results.push(health);
    }
    return results;
  }

  getRegisteredAgents() {
    return Array.from(this.agentRegistry.values()).map(r => ({
      agentId: r.contract.agentId,
      name: r.contract.name,
      role: r.contract.role,
      status: r.contract.status
    }));
  }
}

// ============================================================================
// ATLAS MATRIX - CENTRAL ORCHESTRATOR
// ============================================================================

/**
 * ATLAS MATRIX
 * Central decision-maker that coordinates all specialized agents
 * Implements hierarchical decision-making with human-in-the-loop governance
 */
class ATLASMatrix {
  constructor(db, anthropicClient) {
    this.db = db;
    this.anthropic = anthropicClient;
    this.orchestrationCycle = 0;

    // Initialize specialized agents
    this.signalAgent = new SignalAgent();
    this.riskAgent = new RiskAgent(anthropicClient);
    this.executionAgent = new ExecutionAgent();
    this.regimeAgent = new RegimeAgent();
    this.researchAgent = new ResearchAgent();
    this.qualityAgent = new QualityAgent();
    this.metaOrchestrator = new MetaOrchestratorAgent();

    // Register all agents with meta-orchestrator
    this.metaOrchestrator.registerAgent(this.signalAgent);
    this.metaOrchestrator.registerAgent(this.riskAgent);
    this.metaOrchestrator.registerAgent(this.executionAgent);
    this.metaOrchestrator.registerAgent(this.regimeAgent);
    this.metaOrchestrator.registerAgent(this.researchAgent);
    this.metaOrchestrator.registerAgent(this.qualityAgent);

    this.decisionHistory = [];
    this.escalationQueue = [];
  }

  /**
   * Main orchestration loop - coordinates all agents
   */
  async orchestrate(observationData) {
    this.orchestrationCycle++;
    const cycleId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`\n[ATLAS MATRIX] Orchestration Cycle #${this.orchestrationCycle}`);
    console.log(`Cycle ID: ${cycleId}`);

    try {
      // 1. SIGNAL COLLECTION - Signal Agent gathers raw data
      console.log("\n→ Phase 1: Signal Collection");
      const signals = await this.signalAgent.gatherSignals(observationData.sources || []);
      console.log(`   Signals collected: ${signals.signalCount}`);

      if (signals.signalCount === 0) {
        return this.logCycle(cycleId, "no_signals", startTime, { signals });
      }

      // 2. RISK ANALYSIS - Risk Agent classifies threats
      console.log("\n→ Phase 2: Risk Analysis");
      const analyses = await this.riskAgent.analyzeSignals(signals.signals);
      console.log(`   Analyses completed: ${analyses.analysisCount}`);

      // 3. QUALITY VALIDATION - Quality Agent verifies outputs
      console.log("\n→ Phase 3: Quality Validation");
      const qualityResults = [];
      for (const analysis of analyses.analyses) {
        const qCheck = await this.qualityAgent.validateAnalysis(analysis);
        qualityResults.push(qCheck);
      }
      const validAnalyses = qualityResults.filter(q => q.isValid).length;
      console.log(`   Valid analyses: ${validAnalyses}/${analyses.analysisCount}`);

      // 4. RESEARCH & CORRELATION - Research Agent investigates patterns
      console.log("\n→ Phase 4: Investigation & Correlation");
      const investigations = [];
      for (const analysis of analyses.analyses) {
        const investigation = await this.researchAgent.investigate(
          signals.signals.find(s => s.id === analysis.signalId),
          [] // In production: fetch historical data
        );
        investigations.push(investigation);
      }
      console.log(`   Investigations conducted: ${investigations.length}`);

      // 5. POLICY COMPLIANCE - Regime Agent validates against policies
      console.log("\n→ Phase 5: Policy Compliance Check");
      const complianceResults = [];
      for (const analysis of analyses.analyses) {
        const compCheck = await this.regimeAgent.validateAction(
          { type: "monitor" },
          analysis
        );
        complianceResults.push(compCheck);
      }
      const compliant = complianceResults.filter(c => c.isCompliant).length;
      console.log(`   Compliant: ${compliant}/${complianceResults.length}`);

      // 6. DECISION MAKING - Matrix decides on actions
      console.log("\n→ Phase 6: Decision Making");
      const decisions = [];
      for (const analysis of analyses.analyses) {
        const decision = await this.makeDecision(analysis, cycleId);
        decisions.push(decision);
      }
      const criticalDecisions = decisions.filter(d => d.requiresEscalation).length;
      console.log(`   Decisions: ${decisions.length} (${criticalDecisions} require approval)`);

      // 7. EXECUTION - Execution Agent performs actions
      console.log("\n→ Phase 7: Execution");
      const executions = [];
      for (const decision of decisions) {
        if (!decision.requiresEscalation) {
          const exec = await this.executionAgent.executeAction(decision, decision.recommendedAction);
          executions.push(exec);
        } else {
          // Add to escalation queue for human review
          this.escalationQueue.push({
            id: crypto.randomUUID(),
            cycleId: cycleId,
            decision: decision,
            status: "pending_approval",
            createdAt: new Date().toISOString()
          });
        }
      }
      console.log(`   Executed: ${executions.length}, Escalated: ${this.escalationQueue.length}`);

      // 8. LOGGING & EVIDENCE - Immutable ledger
      console.log("\n→ Phase 8: Evidence Logging");
      this.logCycleToLedger(cycleId, {
        signals: signals,
        analyses: analyses,
        qualityResults: qualityResults,
        investigations: investigations,
        complianceResults: complianceResults,
        decisions: decisions,
        executions: executions,
        escalations: this.escalationQueue.filter(e => e.cycleId === cycleId)
      });

      // 9. META-ORCHESTRATOR HEALTH CHECK
      console.log("\n→ Phase 9: Ecosystem Health");
      const healthStatus = await this.metaOrchestrator.healthCheck();
      console.log(`   Agents healthy: ${healthStatus.length}/${this.metaOrchestrator.agentRegistry.size}`);

      const duration = Date.now() - startTime;
      console.log(`\n✓ Orchestration Complete (${duration}ms)`);

      return {
        cycleId: cycleId,
        cycleNumber: this.orchestrationCycle,
        status: "complete",
        summary: {
          signalsProcessed: signals.signalCount,
          analysesGenerated: analyses.analysisCount,
          decisionsGenerated: decisions.length,
          decisionsEscalated: criticalDecisions,
          actionsExecuted: executions.length
        },
        escalationCount: this.escalationQueue.length,
        duration: duration
      };

    } catch (error) {
      console.error(`[ERROR] Orchestration failed: ${error.message}`);
      return this.logCycle(cycleId, "error", startTime, { error: error.message });
    }
  }

  /**
   * DECISION MAKING - Hierarchical decision logic
   */
  async makeDecision(analysis, cycleId) {
    const decision = {
      id: crypto.randomUUID(),
      cycleId: cycleId,
      riskScore: analysis.riskScore,
      classification: analysis.classification,
      timestamp: new Date().toISOString(),
      recommendedAction: "monitor", // default
      reasoning: analysis.reasoning,
      requiresEscalation: false
    };

    // Decision tree based on risk classification
    if (analysis.classification === "critical") {
      if (analysis.riskScore >= 0.9) {
        decision.recommendedAction = "block_charge";
        decision.reasoning = "Critical risk - immediate blocking recommended";
        decision.requiresEscalation = true;
      } else {
        decision.recommendedAction = "investigate";
        decision.reasoning = "Critical risk - investigation initiated";
        decision.requiresEscalation = true;
      }
    } else if (analysis.classification === "high") {
      decision.recommendedAction = "alert_user";
      decision.reasoning = "High risk - user alert and monitoring";
      decision.requiresEscalation = analysis.riskScore >= 0.8;
    } else if (analysis.classification === "medium") {
      decision.recommendedAction = "monitor";
      decision.reasoning = "Medium risk - continuous monitoring";
    } else {
      decision.recommendedAction = "monitor";
      decision.reasoning = "Low risk - routine monitoring continues";
    }

    this.decisionHistory.push(decision);
    return decision;
  }

  /**
   * Log orchestration cycle to immutable ledger
   */
  logCycleToLedger(cycleId, data) {
    const evidence = {
      id: cycleId,
      timestamp: new Date().toISOString(),
      cycleNumber: this.orchestrationCycle,
      agentEcosystem: this.metaOrchestrator.getRegisteredAgents(),
      signalsProcessed: data.signals?.signalCount || 0,
      analysesGenerated: data.analyses?.analysisCount || 0,
      decisionsGenerated: data.decisions?.length || 0,
      escalationsRequested: data.escalations?.length || 0,
      hash: this.generateHash(JSON.stringify(data))
    };

    // Log to file (in production: SQLite)
    const ledgerPath = path.join(__dirname, '../data/ledger/matrix-cycles.jsonl');
    fs.appendFileSync(ledgerPath, JSON.stringify(evidence) + '\n');

    console.log(`   Evidence logged: ${cycleId}`);
  }

  /**
   * Generate cryptographic hash for integrity verification
   */
  generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get pending escalations for human review
   */
  getEscalationQueue() {
    return this.escalationQueue.map(e => ({
      id: e.id,
      cycleId: e.cycleId,
      decision: e.decision,
      status: e.status,
      requiresApprovalBy: "human_administrator",
      createdAt: e.createdAt
    }));
  }

  /**
   * Process human approval
   */
  async approveDecision(escalationId, approvedBy, approval) {
    const escalation = this.escalationQueue.find(e => e.id === escalationId);
    if (!escalation) return { error: "Escalation not found" };

    escalation.status = approval ? "approved" : "rejected";
    escalation.approvedBy = approvedBy;
    escalation.approvedAt = new Date().toISOString();

    if (approval) {
      const exec = await this.executionAgent.executeAction(
        escalation.decision,
        escalation.decision.recommendedAction
      );
      return { status: "approved", execution: exec };
    }

    return { status: "rejected" };
  }

  /**
   * Continuous learning - analyze outcomes and improve decision logic
   */
  async analyzeOutcomes() {
    const recentDecisions = this.decisionHistory.slice(-100);

    // Analyze accuracy of risk classifications vs actual outcomes
    const outcomes = {
      totalDecisions: recentDecisions.length,
      criticalAccuracy: 0.0,
      highAccuracy: 0.0,
      avgResponseTime: 0.0,
      recommendedAdjustments: []
    };

    // In production: query outcomes from ledger and ML analysis
    if (recentDecisions.filter(d => d.classification === "critical").length > 0) {
      outcomes.criticalAccuracy = 0.85; // Simulated
      if (outcomes.criticalAccuracy < 0.8) {
        outcomes.recommendedAdjustments.push("Review critical risk thresholds");
      }
    }

    return outcomes;
  }

  async logCycle(cycleId, status, startTime, data) {
    const duration = Date.now() - startTime;
    return {
      cycleId: cycleId,
      status: status,
      duration: duration,
      data: data
    };
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("=".repeat(70));
  console.log("ATLAS MATRIX ORCHESTRATOR - Multi-Agent Ecosystem");
  console.log("=".repeat(70));

  // Load environment
  const anthropicKey = process.env.ANTHROPIC_API_KEY || "mock-key-for-demo";

  // Initialize database
  const dbPath = path.join(__dirname, '../data/ledger/atlas.db');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Database error:", err.message);
  });

  // Initialize ATLAS Matrix
  const atlas = new ATLASMatrix(db, null); // Pass real Anthropic client in production

  // Simulate observation data
  const observationData = {
    sources: [
      {
        type: "stripe",
        data: { amount: 8500, currency: "USD", description: "Large charge detected" }
      },
      {
        type: "gmail",
        data: { subject: "Unusual activity alert", body: "Large charge detected" }
      },
      {
        type: "calendar",
        data: { event: "Payment expected" }
      }
    ]
  };

  // Run orchestration cycle
  const result = await atlas.orchestrate(observationData);

  console.log("\n" + "=".repeat(70));
  console.log("ORCHESTRATION RESULT");
  console.log("=".repeat(70));
  console.log(JSON.stringify(result, null, 2));

  // Show escalation queue
  const escalations = atlas.getEscalationQueue();
  if (escalations.length > 0) {
    console.log("\n" + "=".repeat(70));
    console.log("ESCALATIONS PENDING HUMAN APPROVAL");
    console.log("=".repeat(70));
    console.log(JSON.stringify(escalations, null, 2));

    // Simulate human approval
    console.log("\n[SIMULATING HUMAN APPROVAL]");
    for (const escalation of escalations) {
      const approval = Math.random() > 0.3; // 70% approval rate
      const result = await atlas.approveDecision(escalation.id, "admin@example.com", approval);
      console.log(`Decision ${escalation.id.substring(0, 8)}: ${result.status}`);
    }
  }

  // Show learning insights
  console.log("\n" + "=".repeat(70));
  console.log("CONTINUOUS LEARNING ANALYSIS");
  console.log("=".repeat(70));
  const outcomes = await atlas.analyzeOutcomes();
  console.log(JSON.stringify(outcomes, null, 2));

  // Show agent ecosystem status
  console.log("\n" + "=".repeat(70));
  console.log("AGENT ECOSYSTEM STATUS");
  console.log("=".repeat(70));
  console.log(JSON.stringify(atlas.metaOrchestrator.getRegisteredAgents(), null, 2));

  db.close();
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ATLASMatrix, SignalAgent, RiskAgent, ExecutionAgent, RegimeAgent, ResearchAgent, QualityAgent, MetaOrchestratorAgent };
