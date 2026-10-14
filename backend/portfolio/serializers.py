from rest_framework import serializers

from .models import (
    Education,
    Experience,
    Profile,
    Project,
    Skill,
    SkillCategory,
    SocialLink,
)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'id',
            'name',
            'title',
            'intro',
            'email',
            'location',
            'status',
            'bio',
            'education_summary',
            'avatar',
            'resume',
        ]


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'profile', 'platform', 'url', 'icon', 'order']


class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = ['id', 'name', 'order']


class SkillSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Skill
        fields = ['id', 'category', 'category_name', 'name', 'level', 'icon', 'order']


class GroupedSkillCategorySerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = SkillCategory
        fields = ['id', 'name', 'order', 'skills']


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'short_desc',
            'detailed_desc',
            'techs',
            'image',
            'github_url',
            'live_url',
            'featured',
            'order',
        ]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            'id',
            'company',
            'position',
            'description',
            'start_date',
            'end_date',
            'is_current',
            'order',
        ]


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'school', 'degree', 'description', 'start_year', 'end_year', 'order']
