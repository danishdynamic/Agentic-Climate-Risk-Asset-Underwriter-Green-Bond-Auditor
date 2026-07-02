from enum import Enum

class CreditRating(str, Enum):
    AAA = "AAA"
    AA_PLUS = "AA+"
    AA = "AA"
    AA_MINUS = "AA-"
    A_PLUS = "A+"
    A = "A"
    A_MINUS = "A-"
    BBB_PLUS = "BBB+"
    BBB = "BBB"
    BBB_MINUS = "BBB-"
    BB_PLUS = "BB+"
    BB = "BB"
    BB_MINUS = "BB-"
    B_PLUS = "B+"
    B = "B"
    B_MINUS = "B-"
    CCC = "CCC"
    CC = "CC"
    C = "C"
    D = "D"

    @classmethod
    def is_valid(cls, value: str) -> bool:
        return value in [rating.value for rating in cls]

    @property
    def is_investment_grade(self) -> bool:
        # Define the threshold for investment grade
        investment_grade_set = {
            self.AAA, self.AA_PLUS, self.AA, self.AA_MINUS,
            self.A_PLUS, self.A, self.A_MINUS,
            self.BBB_PLUS, self.BBB, self.BBB_MINUS
        }
        return self in investment_grade_set