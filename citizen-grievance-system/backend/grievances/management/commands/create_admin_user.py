from django.core.management.base import BaseCommand, CommandError

from grievances.documents import User


class Command(BaseCommand):
    help = "Create or promote a mobile-number user to admin/super_admin for the prototype."

    def add_arguments(self, parser):
        parser.add_argument("--mobile", required=True, help="Mobile number used for OTP login.")
        parser.add_argument("--name", default="Admin User", help="Display name.")
        parser.add_argument(
            "--role",
            choices=["admin", "super_admin", "officer"],
            default="admin",
            help="Role to assign.",
        )
        parser.add_argument("--email", default="", help="Optional email address.")

    def handle(self, *args, **options):
        mobile = str(options["mobile"]).strip()
        if not mobile:
            raise CommandError("--mobile is required")

        updates = {
            "set__mobile_number": mobile,
            "set__name": options["name"],
            "set__role": options["role"],
            "set__is_verified": True,
            "set__is_blocked": False,
            "set__blocked_reason": "",
        }
        if options["email"]:
            updates["set__email"] = options["email"]

        user = User.objects(mobile_number=mobile).modify(upsert=True, new=True, **updates)

        self.stdout.write(
            self.style.SUCCESS(
                f"{user.mobile_number} is now {user.role}. Login with this mobile number using OTP."
            )
        )
