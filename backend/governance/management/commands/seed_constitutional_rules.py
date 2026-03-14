from django.core.management.base import BaseCommand
from governance.models import Rule

class Command(BaseCommand):
    help = 'Seeds the platform constitutional rules (SR-1 to SR-24)'

    def handle(self, *args, **kwargs):
        system_rules = [
            {
                "code": "SR-15",
                "scope_type": "PLATFORM",
                "action": "CREATE_DISCUSSION",
                "role": "MEMBER",
                "is_system": True,
                "description": "Platform-wide posting limits to prevent flood abuse.",
                "conditions": {"max_per_hour": 5},
                "enforcement": {"type": "BLOCK", "message": "Platform posting limit reached. Slow down to maintain community quality."}
            },
            {
                "code": "SR-18",
                "scope_type": "PLATFORM",
                "action": "CREATE_DISCUSSION",
                "role": "MEMBER",
                "is_system": True,
                "description": "All submissions must follow the designated board structure.",
                "conditions": {"requires_structure": True},
                "enforcement": {"type": "BLOCK", "message": "Submission rejected: Content does not meet platform structural requirements."}
            },
            {
                "code": "SR-8",
                "scope_type": "PLATFORM",
                "action": "FLAG",
                "role": "FACILITATOR",
                "is_system": True,
                "description": "Every moderation action must reference a rule and provide a visible reason.",
                "conditions": {"requires_reason": True},
                "enforcement": {"type": "BLOCK", "message": "Action invalid: Moderation reasons are constitutionally mandatory."}
            },
            {
                "code": "SR-9",
                "scope_type": "PLATFORM",
                "action": "EDIT",
                "role": "FACILITATOR",
                "is_system": True,
                "description": "Facilitators cannot edit or distort member content.",
                "conditions": {"allow_facilitator_edit": False},
                "enforcement": {"type": "BLOCK", "message": "System Block: Facilitators are prohibited from editing member-authored content."}
            },
            {
                "code": "SR-14",
                "scope_type": "PLATFORM",
                "action": "EDIT", # Using EDIT as proxy for "DELETE" logic in ledger
                "role": "SYSTEM",
                "is_system": True,
                "description": "The audit ledger is immutable and cannot be deleted.",
                "conditions": {"immutable_ledger": True},
                "enforcement": {"type": "BLOCK", "message": "Ledger records are permanent and cannot be altered or removed."}
            }
        ]

        for r_data in system_rules:
            Rule.objects.update_or_create(
                code=r_data['code'],
                defaults=r_data
            )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(system_rules)} core Platform Rules.'))
