from rest_framework.routers import DefaultRouter

from .views import (
    DeviceScreenViewSet,
    EducationViewSet,
    ExperienceViewSet,
    ProfileViewSet,
    ProjectViewSet,
    SkillViewSet,
    SocialLinkViewSet,
)

router = DefaultRouter()
router.register(r'device-screen', DeviceScreenViewSet, basename='device-screen')
router.register(r'profile', ProfileViewSet, basename='profile')
router.register(r'social-links', SocialLinkViewSet, basename='social-link')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'experience', ExperienceViewSet, basename='experience')
router.register(r'education', EducationViewSet, basename='education')

urlpatterns = router.urls
