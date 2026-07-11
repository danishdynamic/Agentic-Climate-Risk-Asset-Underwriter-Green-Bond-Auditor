from app.tools.compliance import verify_green_bond_compliance


class ComplianceService:

    async def evaluate(
        self,
        bond,
        milestones,
    ):
        return verify_green_bond_compliance(
            bond_type=bond.bond_type.value,
            coupon_rate=float(bond.coupon_rate),
            documented_milestones=milestones,
            credit_rating=bond.credit_rating,
        )


compliance_service = ComplianceService()