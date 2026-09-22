/**
 * ATLAS Matrix Orchestrator - Phase 7 & 8 Integration
 * 
 * Paste these methods into 08_atlas-matrix-orchestrator.js
 * 
 * STEP 1: Add imports at top:
 * const { ThailandPropertyAgent } = require('../backend/services/thailand-property-agent.js');
 * const { BonusShopMarketingAgent } = require('../backend/services/bonusshop-marketing-agent.js');
 * const { TradingInvestmentAgent } = require('../backend/services/trading-investment-agent.js');
 * 
 * STEP 2: In constructor, add:
 * 'thailand-property-01': new ThailandPropertyAgent(),
 * 'marketing-01': new BonusShopMarketingAgent(),
 * 'trading-01': new TradingInvestmentAgent()
 * 
 * STEP 3: In orchestrate() method after Phase 6, add:
 * cycle.phases.specializedAgents = await this.runSpecializedAgentPhase();
 * cycle.phases.crossAgentCorrelation = await this.correlateSpecializedAgents(cycle);
 * 
 * STEP 4-5: Copy the methods below
 */

// ========================================
// PHASE 7: SPECIALIZED AGENTS ANALYSIS
// ========================================
async runSpecializedAgentPhase() {
  const results = {
    timestamp: new Date(),
    agents: {}
  };

  // Thailand Property Agent - Process property data
  if (this.agents['thailand-property-01']) {
    const propertySignals = this.signals.filter(s => s.source === 'property-broker');
    if (propertySignals.length > 0) {
      results.agents.thailand_property = {
        status: 'active',
        assessments: await Promise.all(
          propertySignals.map(signal =>
            this.agents['thailand-property-01'].assessPropertyCondition(signal.data)
          )
        ),
        roiAnalyses: await Promise.all(
          propertySignals.map(signal =>
            this.agents['thailand-property-01'].calculateRentalROI(signal.data, { total: 1500000 })
          )
        ),
        complianceChecks: await Promise.all(
          propertySignals.map(signal =>
            this.agents['thailand-property-01'].checkLegalCompliance(signal.data, { rentalPlans: ['airbnb', 'booking'] })
          )
        )
      };
    } else {
      results.agents.thailand_property = { status: 'idle' };
    }
  }

  // BonusShop Marketing Agent - Process marketing events
  if (this.agents['marketing-01']) {
    const marketingSignals = this.signals.filter(s => s.source === 'make.com' && s.type === 'campaign_metric');
    if (marketingSignals.length > 0) {
      results.agents.bonusshop_marketing = {
        status: 'active',
        campaignMetrics: await Promise.all(
          marketingSignals.map(signal =>
            this.agents['marketing-01'].calculateCampaignROI(signal.data.campaignId)
          )
        ),
        performanceReport: await this.agents['marketing-01'].generatePerformanceReport(30)
      };
    } else {
      results.agents.bonusshop_marketing = { status: 'idle' };
    }
  }

  // Trading & Investment Agent - Process market data
  if (this.agents['trading-01']) {
    const tradingSignals = this.signals.filter(s => s.source === 'market-data');
    if (tradingSignals.length > 0) {
      results.agents.trading_investment = {
        status: 'active',
        portfolioAnalysis: await this.agents['trading-01'].analyzePortfolio(),
        marketAlerts: await Promise.all(
          tradingSignals.map(signal =>
            this.agents['trading-01'].monitorStock(signal.data.ticker)
          )
        )
      };
    } else {
      results.agents.trading_investment = { status: 'idle' };
    }
  }

  return results;
}

// ========================================
// PHASE 8: CROSS-AGENT CORRELATION
// ========================================
async correlateSpecializedAgents(cycle) {
  const correlation = {
    timestamp: new Date(),
    insights: [],
    triggers: []
  };

  // INSIGHT 1: Property deals → Investment opportunities
  if (cycle.phases.specializedAgents.agents.thailand_property &&
      cycle.phases.specializedAgents.agents.thailand_property.status === 'active') {
    
    const roiAnalyses = cycle.phases.specializedAgents.agents.thailand_property.roiAnalyses;
    const strongDeals = roiAnalyses.filter(roi => roi.roi5Year > 150);

    if (strongDeals.length > 0) {
      correlation.insights.push({
        type: 'PROPERTY_INVESTMENT_OPPORTUNITY',
        source: 'thailand_property_agent',
        deals: strongDeals.length,
        recommendation: `${strongDeals.length} high-ROI property deals available - consider financing options`,
        priority: 'HIGH'
      });

      // Trigger Make.com automation
      correlation.triggers.push({
        agent: 'thailand_property_agent',
        action: 'alert_investment_team',
        makeScenarioId: 'property_strong_roi_v1',
        deals: strongDeals.length
      });
    }
  }

  // INSIGHT 2: Portfolio performance → Marketing budget recommendation
  if (cycle.phases.specializedAgents.agents.trading_investment &&
      cycle.phases.specializedAgents.agents.trading_investment.status === 'active' &&
      this.agents['marketing-01']) {
    
    const portfolio = cycle.phases.specializedAgents.agents.trading_investment.portfolioAnalysis;
    
    if (portfolio.health.status === '✅ Excellent') {
      correlation.insights.push({
        type: 'MARKETING_BUDGET_RECOMMENDATION',
        source: 'portfolio_performance',
        recommendation: 'Strong portfolio health enables 20% marketing budget increase',
        trigger: 'Reinvest 5% of portfolio gains into BonusShop campaigns',
        priority: 'MEDIUM'
      });

      // Trigger Make.com automation
      correlation.triggers.push({
        agent: 'trading_investment_agent',
        action: 'scale_marketing_budget',
        makeScenarioId: 'scale_budget_on_strong_portfolio_v1',
        percentage: 20
      });
    }
  }

  // INSIGHT 3: Marketing ROI → Dividend reinvestment
  if (cycle.phases.specializedAgents.agents.bonusshop_marketing &&
      cycle.phases.specializedAgents.agents.bonusshop_marketing.status === 'active' &&
      this.agents['trading-01']) {
    
    const perfReport = cycle.phases.specializedAgents.agents.bonusshop_marketing.performanceReport;
    const totalROI = perfReport.campaignSummary.totalRevenue / perfReport.campaignSummary.totalBudgetSpent;

    if (totalROI > 3) {
      const surplus = perfReport.campaignSummary.totalRevenue - perfReport.campaignSummary.totalBudgetSpent;
      
      correlation.insights.push({
        type: 'REVENUE_REINVESTMENT',
        source: 'marketing_performance',
        recommendation: `Marketing ROI >3x (${totalROI.toFixed(2)}x) - reinvest $${Math.round(surplus)} into dividend stocks`,
        surplus: Math.round(surplus),
        priority: 'MEDIUM'
      });

      // Trigger Make.com automation
      correlation.triggers.push({
        agent: 'bonusshop_marketing_agent',
        action: 'reinvest_marketing_surplus',
        makeScenarioId: 'reinvest_marketing_profit_v1',
        amount: Math.round(surplus)
      });
    }
  }

  // INSIGHT 4: Legal compliance warnings
  if (cycle.phases.specializedAgents.agents.thailand_property &&
      cycle.phases.specializedAgents.agents.thailand_property.status === 'active') {
    
    const complianceChecks = cycle.phases.specializedAgents.agents.thailand_property.complianceChecks;
    const issues = complianceChecks.filter(c => 
      c.checks.foreignOwnership?.requiresAttention || 
      c.checks.taxObligations?.requiresAttention
    );

    if (issues.length > 0) {
      correlation.insights.push({
        type: 'LEGAL_COMPLIANCE_WARNING',
        source: 'thailand_property_agent',
        issues: issues.length,
        recommendation: 'Escalate to legal team for property review',
        priority: 'HIGH'
      });

      correlation.triggers.push({
        agent: 'thailand_property_agent',
        action: 'alert_legal_team',
        makeScenarioId: 'legal_compliance_review_v1',
        issueCount: issues.length
      });
    }
  }

  return correlation;
}

// ========================================
// UPDATE: Record specialized agent data to ledger
// ========================================
// In recordCycleToLedger(), update the evidence object:
// 
// specializedAgentResults: {
//   thailand_property: cycle.phases.specializedAgents?.agents?.thailand_property?.status || 'inactive',
//   bonusshop_marketing: cycle.phases.specializedAgents?.agents?.bonusshop_marketing?.status || 'inactive',
//   trading_investment: cycle.phases.specializedAgents?.agents?.trading_investment?.status || 'inactive'
// },
// crossAgentCorrelations: cycle.phases.crossAgentCorrelation?.insights?.length || 0,
// automationTriggers: cycle.phases.crossAgentCorrelation?.triggers?.length || 0,

