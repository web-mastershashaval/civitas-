from django.core.management.base import BaseCommand
from governance.models import User, Community, Board, SubBoard, Discussion, Response, CommunityMember
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Seeds the database with existing frontend mock data for seamless transition.'

    def handle(self, *args, **kwargs):
        # 1. Create Default Facilitator
        facilitator, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'role': 'FACILITATOR',
                'password': make_password('admin123'),
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Facilitator: admin'))

        # 2. Create Civic Tech Alliance Community
        community, created = Community.objects.get_or_create(
            name='Civic Tech Alliance',
            defaults={'description': 'A decentralized hub for city-scale problem solving.'}
        )
        
        # Link facilitator to community
        CommunityMember.objects.get_or_create(user=facilitator, community=community)

        # 3. Create Boards
        boards_data = [
            {'name': 'Projects', 'ref': 'B-PRO-01'},
            {'name': 'Ideas', 'ref': 'B-IDE-02'},
            {'name': 'Events', 'ref': 'B-EVE-03'},
            {'name': 'Housing & Zoning', 'ref': 'B-HOU-04'} # For DiscussionDetail mock
        ]

        for b_data in boards_data:
            board, created = Board.objects.get_or_create(
                community=community,
                name=b_data['name'],
                defaults={'ref': b_data['ref']}
            )

            # Add sample Lanes (Sub-Boards) to Housing & Zoning
            if b_data['name'] == 'Housing & Zoning':
                lanes = [
                    {'name': 'Zoning Reform Proposals', 'topic': 'Urban Policy', 'description': 'Formal proposals for zoning amendment.'},
                    {'name': 'Rent Control Research', 'topic': 'Housing Economics', 'description': 'Evidence-based research on rent caps.'},
                    {'name': 'Public Housing Models', 'topic': 'Social Housing', 'description': 'Exploring international public housing strategies.'}
                ]
                for lane in lanes:
                    sub_board, sb_created = SubBoard.objects.get_or_create(
                        board=board,
                        name=lane['name'],
                        defaults={'topic': lane['topic'], 'description': lane['description']}
                    )

                    # Add sample Discussion to one of the lanes
                    if lane['name'] == 'Zoning Reform Proposals':
                        discussion, disc_created = Discussion.objects.get_or_create(
                            sub_board=sub_board,
                            title='Impact of zoning laws on housing density',
                            defaults={
                                'type': 'Evidence / Research',
                                'content': 'A discussion on whether easing zoning restrictions can effectively reduce housing shortages...',
                                'author': facilitator,
                                'sources': ["https://urban-studies-ledger.org/zoning-2024"]
                            }
                        )

                        if disc_created:
                            # Add sample Response
                            Response.objects.create(
                                discussion=discussion,
                                author=facilitator,
                                content='Official Notice: This thread will be moved to the Urban Policy lane...',
                                type='Facilitator Intervention',
                                is_official=True
                            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded Civitas Mock Data.'))
