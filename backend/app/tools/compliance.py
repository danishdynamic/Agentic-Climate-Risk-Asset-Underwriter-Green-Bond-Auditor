from typing import Dict, Any, List

def verify_green_bond_compliance(
    bond_type: str, 
    coupon_rate: float, 
    documented_milestones: List[str]
) -> Dict[str, Any]:
    """
    Executes a deterministic compliance checklist gate for Green Bond alignment.
    """
    mandatory_keywords = ["carbon", "emission", "climate", "renewable", "sustainability", "efficiency"]
    matched_milestones = []
    
    # Evaluate milestone text completeness
    for milestone in documented_milestones:
        if any(keyword in milestone.lower() for keyword in mandatory_keywords):
            matched_milestones.append(milestone)
            
    # Business logic rules
    is_aligned = len(matched_milestones) >= 2 and bond_type.upper() in ["CORPORATE", "SOVEREIGN"]
    
    # Flag risky structural features (e.g., exceptionally high coupon junk bonds masquerading as green)
    risk_signal = "HIGH_YIELD_SCRUTINY" if coupon_rate > 0.08 else "STANDARD"
    
    return {
        "framework_alignment_status": "COMPLIANT" if is_aligned else "NON_COMPLIANT",
        "verified_milestone_count": len(matched_milestones),
        "tracked_compliance_matches": matched_milestones,
        "underwriting_scrutiny_category": risk_signal
    }