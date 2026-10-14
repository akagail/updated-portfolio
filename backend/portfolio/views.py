from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Education, Experience, Profile, Project, Skill, SkillCategory, SocialLink
from .serializers import (
    EducationSerializer,
    ExperienceSerializer,
    GroupedSkillCategorySerializer,
    ProfileSerializer,
    ProjectSerializer,
    SkillSerializer,
    SocialLinkSerializer,
)


class ProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Profile.objects.prefetch_related('social_links').order_by('id')
    serializer_class = ProfileSerializer
    pagination_class = None

    def get_object(self):
        return get_object_or_404(Profile.objects.prefetch_related('social_links').order_by('id'))

    def list(self, request, *args, **kwargs):
        instance = Profile.objects.prefetch_related('social_links').order_by('id').first()
        if instance is None:
            return Response(None, status=404)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class SocialLinkViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SocialLink.objects.select_related('profile').order_by('order')
    serializer_class = SocialLinkSerializer
    pagination_class = None


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SkillSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = Skill.objects.select_related('category').order_by('order')
        category = self.request.query_params.get('category')
        if category:
            if category.isdigit():
                queryset = queryset.filter(category_id=int(category))
            else:
                queryset = queryset.filter(category__name__iexact=category)
        return queryset

    @action(detail=False, methods=['get'])
    def grouped(self, request):
        categories = SkillCategory.objects.prefetch_related('skills').order_by('order')
        serializer = GroupedSkillCategorySerializer(categories, many=True)
        return Response(serializer.data)


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProjectSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = Project.objects.order_by('order')
        featured = self.request.query_params.get('featured')
        if featured is not None:
            if featured.lower() in ('true', '1', 'yes'):
                queryset = queryset.filter(featured=True)
            elif featured.lower() in ('false', '0', 'no'):
                queryset = queryset.filter(featured=False)
        return queryset


class ExperienceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Experience.objects.order_by('order')
    serializer_class = ExperienceSerializer
    pagination_class = None


class EducationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Education.objects.order_by('order')
    serializer_class = EducationSerializer
    pagination_class = None
