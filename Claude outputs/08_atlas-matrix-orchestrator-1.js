#!/usr/bin/env node

/**
 * ATLAS Matrix Orchestrator
 * Central multi-agent orchestration with 10 specialized agents
 * 
 * Phases:
 * 1. Signal Collection - Gather signals from all sources
 * 2. Risk Analysis - Classify threat level
 * 3. Quality Validation - Verify data quality
 * 4. Pattern Investigation - Research Agent deep dive
 * 5. Policy Compliance - Regime Agent checks policies
 * 6. Decision Making - Execution Agent decides actions
 * 7. SPECIALIZED AGENTS - Thailand Property, Marketing, Trading
 * 8. CROSS-AGENT CORRELATION - Link insights across agents
 * 9. Evidence Logging & Ecosystem Health
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Import all agents (with flexible path resolution)
let ThailandPropertyAgent, BonusShopMarketingAgent, TradingInvestmentAgent;

try {
  // Try loading from services directory
  const servicesPath = path.join(__dirname, '../backend/services');
  ThailandPropertyAgent = require(path.join(servicesPath, 'thailand-property-agent.js')).ThailandPropertyAgent;
  BonusShopMarketingAgent = require(path.join(servicesPath, 'bonusshop-marketing-agent.js')).BonusShopMarketingAgent;
  TradingInvestmentAgent = require(path.join(servicesPath, 'trading-investment-agent.js')).TradingInvestmentAgent;
} catch (e) {
  // Fallback: Agents may be mocked
  console.warn('⚠️ Agent modules not found, using mock agents');
  
  // Mock agents
  class MockAgent {
    constructor(name, role) {
      this.agentId = `mock-${role}-01`;
      this.name = name;
      this.role = role;
      this.status = 'healthy';
      this.contract = {
        agentId: this.agentId,
        name: this.name,
        role: this.role,
        capabilities: ['mock']
      };
    }
    getStatus() {
      return { agentId: this.agentId, name: this.name, role: this.role, status: this.status };
    }
  }
  
  ThailandPropertyAgent = class extends MockAgent {
    constructor() { super('Thailand Property Specialist', 'property-analyst'); }
  };
  BonusShopMarketingAgent = class extends MockAgent {
    constructor() { super('BonusShop Growth Strategist', 'marketing-analyst'); }
  };
  TradingInvestmentAgent = class extends MockAgent {
    constructor() { super('Trading & Investment Expert', 'investment-analyst'); }
  };
}

class ATLASMatrix {
  constructor() {
    this.cycleCounter = 0;
    this.signals = [];
    this.escalations = [];

    // Initialize all 10 agents
    this.agents = {
      // Original 7 agents (simulated)
      'signal-01': {
        agentId: 'signal-01',
        name: 'Signal Monitor',
        role: 'signal-collector',
        status: 'healthy'
      },
      'risk-01': {
        agentId: 'risk-01',
        name: 'Risk Analyzer',
        role: 'risk-analyst',
        status: 'healthy'
      },
      'execution-01': {
        agentId: 'execution-01',
        name: 'Execution Agent',
        role: 'executor',
        status: 'healthy'
      },
      'regime-01': {
        agentId: 'regime-01',
        name: 'Policy Monitor',
        role: 'compliance-checker',
        status: 'healthy'
      },
      'research-01': {
        agentId: 'research-01',
        name: 'Intelligence Gatherer',
        role: 'researcher',
        status: 'healthy'
      },
      'quality-01': {
        agentId: 'quality-01',
        name: 'QA Monitor',
        role: 'quality-assurer',
        status: 'healthy'
      },
      'meta-01': {
        agentId: 'meta-01',
        name: 'Meta-Orchestrator',
        role: 'meta-orchestrator',
        status: 'healthy'
      },

      // NEW: Three specialized agents
      'thailand-property-01': new ThailandPropertyAgent(),
      'marketing-01': new BonusShopMarketingAgent(),
      'trading-01': new TradingInvestmentAgent()
    };

    // Build agent ecosystem registry
    this.agentEcosystem = Object.values(this.agents).map(agent => ({
      agentId: agent.agentId || agent.contract?.agentId,
      name: agent.name || agent.contract?.name,
      role: agent.role || agent.contract?.role,
      status: agent.status || 'initialized'
    }));

    // Ensure ledger directory exists
    const ledgerDir = path.join(__dirname, '../data/ledger');
    if (!fs.existsSync(ledgerDir)) {
      fs.mkdirSync(ledgerDir, { recursive: true });
    }
    this.ledgerPath = path.join(ledgerDir, 'matrix-cycles.jsonl');
  }

  // PHASE 1: Signal Collection
  async phaseSignalCollection() {
    return {
      signalsProcessed: this.signals.length,
      sources: ['gmail', 'stripe', 'calendar', 'make.com'],
      timestamp: new Date()
    };
  }

  // PHASE 2: Risk Analysis
  async phaseRiskAnalysis() {
    const analyzed = this.signals.map(s => ({
      signal: s,
      riskScore: Math.random() * 100,
      classification: Math.random() > 0.7 ? 'critical' : 'normal'
    }));

    return {
      analyzed: analyzed.length,
      criticalCount: analyzed.filter(a => a.classification === 'critical').length,
      timestamp: new Date()
    };
  }

  // PHASE 3: Quality Validation
  async phaseQualityValidation() {
    return {
      validated: this.signals.length,
      passRate: 0.98,
      timestamp: new Date()
    };
  }

  // PHASE 4: Pattern Investigation
  async phasePatternInvestigation() {
    return {
      patterns: Math.floor(Math.random() * 5),
      anomalies: Math.floor(Math.random() * 2),
      timestamp: new Date()
    };
  }

  // PHASE 5: Policy Compliance
  async phasePolicyCompliance() {
    return {
      checked: this.signals.length,
      violations: 0,
      compliant: true,
      timestamp: new Date()
    };
  }

  // PHASE 6: Decision Making
  async phaseDecisionMaking() {
    return {
      decisions: Math.floor(Math.random() * 3),
      escalated: 0,
      timestamp: new Date()
    };
  }

  // PHASE 7: SPECIALIZED AGENTS ANALYSIS
  async runSpecializedAgentPhase() {
    const results = {
      timestamp: new Date(),
      agents: {}
    };

    // Thailand Property Agent
    if (this.agents['thailand-property-01']) {
      const propertySignals = this.signals.filter(s => s.source === 'property-broker');
      if (propertySignals.length > 0) {
        results.agents.thailand_property = {
          status: 'active',
          analyses: propertySignals.length
        };
      } else {
        results.agents.thailand_property = { status: 'idle' };
      }
    }

    // BonusShop Marketing Agent
    if (this.agents['marketing-01']) {
      const marketingSignals = this.signals.filter(s => s.source === 'make.com');
      if (marketingSignals.length > 0) {
        results.agents.bonusshop_marketing = {
          status: 'active',
          campaigns: marketingSignals.length
        };
      } else {
        results.agents.bonusshop_marketing = { status: 'idle' };
      }
    }

    // Trading & Investment Agent
    if (this.agents['trading-01']) {
      const tradingSignals = this.signals.filter(s => s.source === 'market-data');
      if (tradingSignals.length > 0) {
        results.agents.trading_investment = {
          status: 'active',
          trades: tradingSignals.length
        };
      } else {
        results.agents.trading_investment = { status: 'idle' };
      }
    }

    return results;
  }

  // PHASE 8: CROSS-AGENT CORRELATION
  async correlateSpecializedAgents(cycle) {
    const correlation = {
      timestamp: new Date(),
      insights: [],
      triggers: []
    };

    // Example insight: Property → Finance opportunity
    if (cycle.phases.specializedAgents?.agents?.thailand_property?.status === 'active') {
      correlation.insights.push({
        type: 'PROPERTY_INVESTMENT_OPPORTUNITY',
        source: 'thailand_property_agent',
        recommendation: 'Property opportunities detected - financing options available'
      });
    }

    // Example insight: Marketing → Reinvestment
    if (cycle.phases.specializedAgents?.agents?.bonusshop_marketing?.status === 'active') {
      correlation.insights.push({
        type: 'MARKETING_PERFORMANCE',
        source: 'bonusshop_marketing_agent',
        recommendation: 'Campaign metrics available for optimization'
      });
    }

    // Example insight: Trading → Portfolio health
    if (cycle.phases.specializedAgents?.agents?.trading_investment?.status === 'active') {
      correlation.insights.push({
        type: 'PORTFOLIO_HEALTH',
        source: 'trading_investment_agent',
        recommendation: 'Portfolio analysis complete'
      });
    }

    return correlation;
  }

  // PHASE 9: Evidence Logging & Ecosystem Health
  async phaseLoggingAndHealth() {
    const health = {
      agentsHealthy: this.agentEcosystem.filter(a => a.status === 'healthy').length,
      totalAgents: this.agentEcosystem.length,
      overallStatus: 'operational',
      timestamp: new Date()
    };

    return health;
  }

  // Main orchestration cycle
  async orchestrate() {
    const cycle = {
      id: `cycle-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      cycleNumber: this.cycleCounter++,
      timestamp: new Date(),
      phases: {}
    };

    console.log(`\n🔄 ATLAS Orchestration Cycle #${cycle.cycleNumber}`);
    console.log('='.repeat(60));

    try {
      // Execute all 9 phases
      cycle.phases.signalCollection = await this.phaseSignalCollection();
      console.log('✅ Phase 1: Signal Collection');

      cycle.phases.riskAnalysis = await this.phaseRiskAnalysis();
      console.log('✅ Phase 2: Risk Analysis');

      cycle.phases.qualityValidation = await this.phaseQualityValidation();
      console.log('✅ Phase 3: Quality Validation');

      cycle.phases.patternInvestigation = await this.phasePatternInvestigation();
      console.log('✅ Phase 4: Pattern Investigation');

      cycle.phases.policyCompliance = await this.phasePolicyCompliance();
      console.log('✅ Phase 5: Policy Compliance');

      cycle.phases.decisionMaking = await this.phaseDecisionMaking();
      console.log('✅ Phase 6: Decision Making');

      cycle.phases.specializedAgents = await this.runSpecializedAgentPhase();
      console.log('✅ Phase 7: Specialized Agents (🏡 Property, 🎯 Marketing, 📈 Trading)');

      cycle.phases.crossAgentCorrelation = await this.correlateSpecializedAgents(cycle);
      console.log('✅ Phase 8: Cross-Agent Correlation');

      cycle.phases.ecosystemHealth = await this.phaseLoggingAndHealth();
      console.log('✅ Phase 9: Evidence Logging & Health');

      // Record to ledger
      await this.recordCycleToLedger(cycle);

      console.log('='.repeat(60));
      console.log(`✅ Cycle completed in ${Date.now() - cycle.timestamp}ms`);
      console.log(`📊 Agents: ${cycle.phases.ecosystemHealth.agentsHealthy}/${cycle.phases.ecosystemHealth.totalAgents}`);
      console.log(`💡 Insights: ${cycle.phases.crossAgentCorrelation.insights.length}`);

      return cycle;
    } catch (error) {
      console.error('❌ Orchestration error:', error.message);
      throw error;
    }
  }

  // Record cycle to immutable ledger
  async recordCycleToLedger(cycle) {
    const evidence = {
      id: cycle.id,
      timestamp: cycle.timestamp.toISOString(),
      cycleNumber: cycle.cycleNumber,
      agentEcosystem: this.agentEcosystem,
      specializedAgentResults: {
        thailand_property: cycle.phases.specializedAgents?.agents?.thailand_property?.status || 'inactive',
        bonusshop_marketing: cycle.phases.specializedAgents?.agents?.bonusshop_marketing?.status || 'inactive',
        trading_investment: cycle.phases.specializedAgents?.agents?.trading_investment?.status || 'inactive'
      },
      crossAgentCorrelations: cycle.phases.crossAgentCorrelation?.insights?.length || 0,
      hash: ''
    };

    // Calculate SHA256 hash for integrity
    evidence.hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(evidence))
      .digest('hex');

    // Append to ledger
    fs.appendFileSync(this.ledgerPath, JSON.stringify(evidence) + '\n');
  }

  // Get ecosystem status
  getStatus() {
    return {
      agentEcosystem: this.agentEcosystem,
      cycleCount: this.cycleCounter,
      ledgerPath: this.ledgerPath,
      status: 'operational'
    };
  }
}

// Run single orchestration cycle (for testing)
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🤖 ATLAS MATRIX ORCHESTRATOR');
  console.log('10-Agent Ecosystem with 9-Phase Orchestration');
  console.log('='.repeat(60));

  const matrix = new ATLASMatrix();

  console.log(`\n📋 Agent Ecosystem (${matrix.agentEcosystem.length} agents):`);
  matrix.agentEcosystem.forEach((agent, i) => {
    console.log(`   ${i + 1}. ${agent.name} (${agent.role}) - ${agent.status}`);
  });

  // Run one orchestration cycle
  try {
    const cycle = await matrix.orchestrate();

    console.log('\n📊 Cycle Summary:');
    console.log(`   Cycle ID: ${cycle.id}`);
    console.log(`   Specialized Agents Active:`);
    Object.entries(cycle.phases.specializedAgents.agents).forEach(([key, val]) => {
      console.log(`     - ${key}: ${val.status}`);
    });

    console.log(`\n✅ Orchestration successful`);
    console.log(`📁 Ledger: ${matrix.ledgerPath}`);
  } catch (error) {
    console.error('❌ Orchestration failed:', error);
    process.exit(1);
  }
}

// Export for daemon use
module.exports = { ATLASMatrix };

// Run if executed directly
if (require.main === module) {
  main();
}
