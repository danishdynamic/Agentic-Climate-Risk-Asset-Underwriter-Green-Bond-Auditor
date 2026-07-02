from typing import Dict, Any, List
from .credit_rating import CreditRating

def verify_green_bond_compliance(
    bond_type: str, 
    coupon_rate: float, 
    documented_milestones: List[str],
    credit_rating: str  # Now accepting the string rating
) -> Dict[str, Any]:
    """
    Executes a deterministic compliance checklist gate for Green Bond alignment,
    adjusted by issuer credit risk.
    """
    
    # Define ratings that require enhanced scrutiny (Speculative/Junk)
    # Using the CreditRating helper for clean identification
    speculative_grades = {
        CreditRating.BB_PLUS, CreditRating.BB, CreditRating.BB_MINUS,
        CreditRating.B_PLUS, CreditRating.B, CreditRating.B_MINUS,
        CreditRating.CCC, CreditRating.CC, CreditRating.C, CreditRating.D
    }
    
    is_speculative = credit_rating in [r.value for r in speculative_grades]
    
    mandatory_keywords = ["carbon", "emission", "climate", "renewable", "sustainability", "efficiency"]
    matched_milestones = []
    
    # Evaluate milestone text completeness
    for milestone in documented_milestones:
        if any(keyword in milestone.lower() for keyword in mandatory_keywords):
            matched_milestones.append(milestone)
            
    # Business logic rules: 
    # Stricter compliance bar (3 milestones) if the issuer is speculative
    required_milestones = 3 if is_speculative else 2
    
    is_aligned = len(matched_milestones) >= required_milestones and bond_type.upper() in ["CORPORATE", "SOVEREIGN"]
    
    # Flag risky structural features
    # Enhanced scrutiny for speculative issuers or exceptionally high coupons
    risk_signal = "ENHANCED_SCRUTINY" if (coupon_rate > 0.08 or is_speculative) else "STANDARD"
    
    return {
        "framework_alignment_status": "COMPLIANT" if is_aligned else "NON_COMPLIANT",
        "verified_milestone_count": len(matched_milestones),
        "tracked_compliance_matches": matched_milestones,
        "underwriting_scrutiny_category": risk_signal
    }