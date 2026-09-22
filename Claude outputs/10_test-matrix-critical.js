#!/usr/bin/env node

const { ATLASMatrix } = require('./08_atlas-matrix-orchestrator.js');

const criticalData = {
  sources: [
    {
      type: "stripe",
      data: {
        amount: 18500,  // Over $15k policy limit - CRITICAL
        currency: "USD",
        description: "Unexpected large charge"
      }
    },
    {
      type: "gmail",
      data: {
        subject: "FRAUD ALERT: Unauthorized transaction detected",  // Triggers critical
        body: "Multiple charges in unusual pattern detected"
      }
    },
    {
      type: "calendar",
      data: {
        event: "No scheduled payment today"
      }
    }
  ]
};

async function testCritical() {
  console.log("\n" + "=".repeat(80));
  console.log("🚨 ATLAS MATRIX - CRITICAL RISK TEST");
  console.log("=".repeat(80));
  
  const atlas = new ATLASMatrix();
  
  console.log("\n📊 SIMULATED INCIDENT:");
  console.log("   ✗ Large charge detected: $18,500 (exceeds $15k policy limit)");
  console.log("   ✗ Fraud alert received from bank");
  console.log("   ✗ No scheduled payment in calendar");
  console.log("   → This should trigger CRITICAL risk and ESCALATE to human\n");
  
  const result = await atlas.orchestrate(criticalData);
  
  console.log("\n" + "─".repeat(80));
  console.log("\n📈 ORCHESTRATION RESULTS:\n");
  console.log(`✓ Cycle: #${result.cycleNumber}`);
  console.log(`✓ Signals: ${result.summary.signalsProcessed}`);
  console.log(`✓ Analyses: ${result.summary.analysesGenerated}`);
  console.log(`✓ Decisions: ${result.summary.decisionsGenerated}`);
  console.log(`✓ ESCALATIONS: ${result.summary.decisionsEscalated} ⚠️`);
  console.log(`✓ Actions executed: ${result.summary.actionsExecuted}`);
  console.log(`✓ Duration: ${result.duration}ms`);
  
  // Get escalation queue
  const escalations = atlas.getEscalationQueue();
  
  if (escalations.length > 0) {
    console.log("\n" + "─".repeat(80));
    console.log("\n🚨 ESCALATIONS PENDING APPROVAL:\n");
    
    escalations.forEach((esc, i) => {
      console.log(`\n   ┌─ Decision ${i+1} ─────────────────────────────────┐`);
      console.log(`   │ ID: ${esc.id}`);
      console.log(`   │ Risk Score: ${(esc.decision.riskScore * 100).toFixed(0)}% (${esc.decision.classification})`);
      console.log(`   │ Recommended Action: ${esc.decision.recommendedAction}`);
      console.log(`   │ Reasoning: ${esc.decision.reasoning}`);
      console.log(`   │ Status: ${esc.status}`);
      console.log(`   │ Requires: HUMAN ADMINISTRATOR APPROVAL`);
      console.log(`   │ Created: ${new Date(esc.createdAt).toISOString()}`);
      console.log(`   └────────────────────────────────────────────────┘`);
    });
    
    // Simulate admin approval workflow
    console.log("\n" + "─".repeat(80));
    console.log("\n👤 ADMINISTRATOR DECISION WORKFLOW:\n");
    
    for (let i = 0; i < escalations.length; i++) {
      const esc = escalations[i];
      const approved = i === 0; // Approve first, reject others for demo
      
      console.log(`\n   [Decision ${i+1}] Admin reviews escalation:`);
      console.log(`   → Risk level: ${(esc.decision.riskScore * 100).toFixed(0)}%`);
      console.log(`   → Recommended action: ${esc.decision.recommendedAction}`);
      
      const approval = await atlas.approveDecision(
        esc.id,
        "roy.admin@bonusvarsel.no",
        approved
      );
      
      if (approved) {
        console.log(`   ✅ APPROVED - Executing: ${esc.decision.recommendedAction}`);
        if (approval.execution) {
          console.log(`      • Action ID: ${approval.execution.id}`);
          console.log(`      • Status: ${approval.execution.status}`);
        }
      } else {
        console.log(`   ❌ REJECTED - Action blocked by admin`);
      }
    }
  } else {
    console.log("\n⚠️  No escalations generated (check risk thresholds)");
  }
  
  // Audit trail
  console.log("\n" + "─".repeat(80));
  console.log("\n📋 AUDIT TRAIL & LEARNING:\n");
  
  const outcomes = await atlas.analyzeOutcomes();
  console.log(`   Decisions analyzed: ${outcomes.totalDecisions}`);
  console.log(`   Critical accuracy: ${(outcomes.criticalAccuracy * 100).toFixed(1)}%`);
  console.log(`   Learning insights: ${outcomes.recommendedAdjustments.length > 0 ? outcomes.recommendedAdjustments.join(", ") : "None"}`);
  
  console.log("\n" + "=".repeat(80));
  console.log("✅ CRITICAL TEST COMPLETE");
  console.log("=".repeat(80) + "\n");
}

testCritical().catch(console.error);
