from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Education,
    Experience,
    Profile,
    Project,
    Skill,
    SkillCategory,
    SocialLink,
)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "title", "email", "location", "status")
    search_fields = ("name", "title", "email", "location")
    ordering = ("id",)
    readonly_fields = ("avatar_preview",)

    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" style="max-height:100px;" />', obj.avatar.url)
        return "—"

    avatar_preview.short_description = "Avatar preview"


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ("platform", "url", "profile", "order")
    list_filter = ("platform",)
    search_fields = ("platform", "url")
    ordering = ("order",)


@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "order")
    search_fields = ("name",)
    ordering = ("order",)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "level", "order")
    list_filter = ("category",)
    search_fields = ("name", "level")
    ordering = ("order",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "short_desc", "featured", "order")
    list_filter = ("featured",)
    search_fields = ("title", "short_desc")
    ordering = ("order",)
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:100px;" />', obj.image.url)
        return "—"

    image_preview.short_description = "Image preview"


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ("position", "company", "start_date", "end_date", "is_current", "order")
    list_filter = ("is_current", "company")
    search_fields = ("position", "company")
    ordering = ("order",)


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ("degree", "school", "start_year", "end_year", "order")
    list_filter = ("school",)
    search_fields = ("degree", "school")
    ordering = ("order",)
