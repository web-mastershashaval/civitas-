from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import User, Discussion, Response, Follow, Notification, SubBoard, Board

@receiver(post_save, sender=Discussion)
def notify_new_discussion(sender, instance, created, **kwargs):
    if created:
        # Notify SubBoard followers
        sb_followers = Follow.objects.filter(content_type='SUB_BOARD', object_id=instance.sub_board.id)
        for follow in sb_followers:
            if follow.user != instance.author:
                Notification.objects.create(
                    user=follow.user,
                    title=f"New Post in {instance.sub_board.name}",
                    message=f"{instance.author.username} started: {instance.title}",
                    link=f"/member/community/{instance.sub_board.board.community.id}/discussion/{instance.id}"
                )
        
        # Notify Board followers
        b_followers = Follow.objects.filter(content_type='BOARD', object_id=instance.sub_board.board.id)
        for follow in b_followers:
            if follow.user != instance.author:
                Notification.objects.create(
                    user=follow.user,
                    title=f"New Activity in {instance.sub_board.board.name}",
                    message=f"A new thread '{instance.title}' was created in {instance.sub_board.name}.",
                    link=f"/member/community/{instance.sub_board.board.community.id}/discussion/{instance.id}"
                )

@receiver(post_save, sender=Response)
def notify_new_response(sender, instance, created, **kwargs):
    if created:
        # 1. Notify Discussion Author
        if instance.author != instance.discussion.author:
            Notification.objects.create(
                user=instance.discussion.author,
                title=f"New Reply to your thread",
                message=f"{instance.author.username} replied to '{instance.discussion.title}'",
                link=f"/member/community/{instance.discussion.sub_board.board.community.id}/discussion/{instance.discussion.id}"
            )
        
        # 2. Notify SubBoard followers
        sb_followers = Follow.objects.filter(content_type='SUB_BOARD', object_id=instance.discussion.sub_board.id)
        for follow in sb_followers:
            # Don't notify if they are the author of the reply OR the author of the discussion (already notified)
            if follow.user != instance.author and follow.user != instance.discussion.author:
                Notification.objects.create(
                    user=follow.user,
                    title=f"New Contribution in {instance.discussion.sub_board.name}",
                    message=f"{instance.author.username} contributed to '{instance.discussion.title}'",
                    link=f"/member/community/{instance.discussion.sub_board.board.community.id}/discussion/{instance.discussion.id}"
                )

@receiver(post_save, sender=Follow)
def notify_facilitators_on_follow(sender, instance, created, **kwargs):
    if created:
        community = None
        target_name = ""
        
        if instance.content_type == 'BOARD':
            try:
                board = Board.objects.get(id=instance.object_id)
                community = board.community
                target_name = f"Board: {board.name}"
            except Board.DoesNotExist:
                return
        elif instance.content_type == 'SUB_BOARD':
            try:
                sub_board = SubBoard.objects.get(id=instance.object_id)
                community = sub_board.board.community
                target_name = f"Sub-board: {sub_board.name}"
            except SubBoard.DoesNotExist:
                return
        
        if community:
            facilitators = User.objects.filter(
                communitymember__community=community, 
                role__in=['FACILITATOR', 'CO_FACILITATOR'],
                communitymember__status='ACTIVE'
            )
            for fac in facilitators:
                if fac != instance.user:
                    Notification.objects.create(
                        user=fac,
                        title="New Follower Activity",
                        message=f"Member {instance.user.username} started following {target_name}",
                        link=f"/facilitator/community/{community.id}/manage"
                    )

@receiver(post_delete, sender=Follow)
def notify_facilitators_on_unfollow(sender, instance, **kwargs):
    community = None
    target_name = ""
    
    if instance.content_type == 'BOARD':
        try:
            board = Board.objects.get(id=instance.object_id)
            community = board.community
            target_name = f"Board: {board.name}"
        except Board.DoesNotExist:
            return
    elif instance.content_type == 'SUB_BOARD':
        try:
            sub_board = SubBoard.objects.get(id=instance.object_id)
            community = sub_board.board.community
            target_name = f"Sub-board: {sub_board.name}"
        except SubBoard.DoesNotExist:
            return
    
    if community:
        facilitators = User.objects.filter(
            communitymember__community=community, 
            role__in=['FACILITATOR', 'CO_FACILITATOR'],
            communitymember__status='ACTIVE'
        )
        for fac in facilitators:
            if fac != instance.user:
                Notification.objects.create(
                    user=fac,
                    title="Follower Reduction Alert",
                    message=f"Member {instance.user.username} stopped following {target_name}",
                    link=f"/facilitator/community/{community.id}/manage"
                )
