from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class FullDjangoModelPermissions(permissions.DjangoModelPermissions):
    def __init__(self) -> None:
        self.perms_map['GET'] = ['%(app_label)s.view_%(model_name)s']

class ViewCustomerHistoryPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('store.view_history')
    
class UploadProductImagePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('store.upload_productimage')
    

class IsNotAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        return not request.user.is_authenticated

class IsAdminOrOwnerForCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        #customer_pk is the id after "/store/customer/"
        customer_pk = view.kwargs.get('customer_pk')
        if not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        if customer_pk:
            try:
                customer_id = int(customer_pk)
                return request.user.customer.id == customer_id
            except (ValueError, AttributeError):
                return False
        return False