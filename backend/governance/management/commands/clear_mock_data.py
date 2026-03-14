from django.core.management.base import BaseCommand
from governance.models import User, Community, Board, SubBoard, Discussion, Response, CommunityMember, Rule, RuleDecision

class Command(BaseCommand):
    help = 'Purges all mock data (communities, boards, discussions) while preserving admin accounts and rules.'

    def handle(self, *args, **kwargs):
        self.stdout.write('Initializing system cleanup...')

        # 1. Delete user-generated content
        count, _ = Response.objects.all().delete()
        self.stdout.write(f'Deleted {count} responses.')

        count, _ = Discussion.objects.all().delete()
        self.stdout.write(f'Deleted {count} discussions.')

        count, _ = SubBoard.objects.all().delete()
        self.stdout.write(f'Deleted {count} sub-boards.')

        count, _ = Board.objects.all().delete()
        self.stdout.write(f'Deleted {count} boards.')

        count, _ = CommunityMember.objects.all().delete()
        self.stdout.write(f'Deleted {count} community memberships.')

        count, _ = Community.objects.all().delete()
        self.stdout.write(f'Deleted {count} communities.')

        # 2. Delete non-system rules and decisions
        count, _ = RuleDecision.objects.all().delete()
        self.stdout.write(f'Deleted {count} rule decisions.')

        # Preserve System Rules (is_system=True)
        count, _ = Rule.objects.filter(is_system=False).delete()
        self.stdout.write(f'Deleted {count} custom rules.')

        # 3. Cleanup users except the primary admin
        # Keep superusers and facilitators if they are the main admin
        users_to_keep = ['admin', 'system']
        deleted_users, _ = User.objects.exclude(username__in=users_to_keep).exclude(is_superuser=True).delete()
        self.stdout.write(f'Deleted {deleted_users} mock user accounts.')

        self.stdout.write(self.style.SUCCESS('System cleanup complete. Database is now in a fresh state.'))
