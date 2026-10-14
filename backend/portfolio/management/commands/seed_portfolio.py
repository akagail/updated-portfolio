from datetime import date

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from portfolio.models import (
    Education,
    Experience,
    Profile,
    Project,
    Skill,
    SkillCategory,
    SocialLink,
)


class Command(BaseCommand):
    help = (
        "Fill the portfolio with placeholder data so the front end has "
        "something to render. Replace everything in the Django admin."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all existing portfolio data before seeding.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            for model in (
                Skill,
                SkillCategory,
                SocialLink,
                Project,
                Experience,
                Education,
                Profile,
            ):
                model.objects.all().delete()
        elif Profile.objects.exists():
            raise CommandError(
                "Portfolio data already exists. "
                "Re-run with --reset to replace it."
            )

        profile = Profile.objects.create(
            name="Alex Morgan",
            title="Full-stack developer",
            intro=(
                "I design and build web products end to end, from the "
                "database schema to the last pixel of the interface."
            ),
            email="hello@example.com",
            location="Remote, worldwide",
            status="Open to freelance work",
            bio=(
                "I'm a full-stack developer who likes turning messy "
                "requirements into software that feels simple to use. "
                "Most of my work sits between Django APIs and React "
                "front ends.\n\n"
                "I care about accessibility, readable code and small, "
                "well-tested changes. Away from the keyboard I'm usually "
                "reading, cycling or tinkering with side projects."
            ),
            education_summary=(
                "B.S. in Computer Science, graduated 2021, with a focus "
                "on software engineering and databases."
            ),
        )
        # Avatar and résumé are file uploads: add them in the Django admin.
        # Without an avatar the About card shows the initials "AM".

        for order, (platform, url) in enumerate(
            [
                ("GitHub", "https://github.com/your-username"),
                ("LinkedIn", "https://www.linkedin.com/in/your-username"),
            ]
        ):
            SocialLink.objects.create(
                profile=profile, platform=platform, url=url, order=order
            )

        skills = {
            "Frontend": [
                ("React", "Advanced"),
                ("Next.js", "Advanced"),
                ("TypeScript", "Advanced"),
                ("Tailwind CSS", "Intermediate"),
            ],
            "Backend": [
                ("Django", "Advanced"),
                ("Django REST Framework", "Advanced"),
                ("PostgreSQL", "Intermediate"),
                ("REST API design", "Advanced"),
            ],
            "Tooling": [
                ("Git", "Advanced"),
                ("Docker", "Intermediate"),
                ("Figma", "Intermediate"),
                ("Linux", "Intermediate"),
            ],
        }
        for cat_order, (cat_name, items) in enumerate(skills.items()):
            category = SkillCategory.objects.create(
                name=cat_name, order=cat_order
            )
            for order, (name, level) in enumerate(items):
                Skill.objects.create(
                    category=category, name=name, level=level, order=order
                )

        projects = [
            {
                "title": "Harbor",
                "short_desc": (
                    "Inventory tracker for small shops, with barcode "
                    "scanning and low-stock alerts."
                ),
                "detailed_desc": (
                    "Harbor replaces spreadsheets for shop owners. It "
                    "tracks stock levels, scans barcodes from a phone "
                    "camera and emails a digest when items run low."
                ),
                "techs": ["Django", "PostgreSQL", "React", "Docker"],
                "featured": True,
            },
            {
                "title": "Pages",
                "short_desc": (
                    "A reading log that turns finished books into a "
                    "year-in-review."
                ),
                "detailed_desc": (
                    "Pages lets readers log books, add notes and see "
                    "yearly stats. Built mobile-first with offline "
                    "support."
                ),
                "techs": ["Next.js", "TypeScript", "Tailwind CSS"],
                "featured": True,
            },
            {
                "title": "Tidewatch",
                "short_desc": (
                    "Live dashboard for tide and weather data along a "
                    "local coastline."
                ),
                "detailed_desc": (
                    "Tidewatch pulls public tide and weather feeds, "
                    "caches them and charts the next 48 hours."
                ),
                "techs": ["Django REST Framework", "Chart.js", "Redis"],
                "featured": False,
            },
            {
                "title": "Notebook CLI",
                "short_desc": (
                    "Command-line notes app that syncs plain Markdown "
                    "files to a Git repo."
                ),
                "detailed_desc": (
                    "A small tool for people who live in the terminal: "
                    "create, search and sync notes without leaving the "
                    "shell."
                ),
                "techs": ["Python", "Git"],
                "featured": False,
            },
        ]
        for order, data in enumerate(projects):
            Project.objects.create(order=order, **data)

        Experience.objects.create(
            company="Brightside Labs",
            position="Product Engineer",
            description=(
                "Own features across a Django and Next.js stack, from "
                "API design to accessible UI. Cut average page load time "
                "by a third by reworking data fetching."
            ),
            start_date=date(2024, 3, 1),
            is_current=True,
            order=0,
        )
        Experience.objects.create(
            company="Northwind Studio",
            position="Junior Web Developer",
            description=(
                "Built client websites and internal tools, and moved the "
                "team's deployments to Docker."
            ),
            start_date=date(2022, 6, 1),
            end_date=date(2024, 2, 29),
            order=1,
        )
        Experience.objects.create(
            company="Self-employed",
            position="Freelance Developer",
            description=(
                "Delivered small business sites and booking tools for "
                "local clients."
            ),
            start_date=date(2021, 1, 1),
            end_date=date(2022, 5, 31),
            order=2,
        )

        Education.objects.create(
            school="State University",
            degree="B.S. in Computer Science",
            description=(
                "Coursework in algorithms, databases and software "
                "engineering. Capstone: a scheduling app for a campus "
                "clinic."
            ),
            start_year=2017,
            end_year=2021,
            order=0,
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Seeded placeholder portfolio data. "
                "Edit it in the Django admin at /admin/."
            )
        )