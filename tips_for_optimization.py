# 1. Optimize the Python code:
# Preload related objects
Product.objects.select_related('...')
Product.objects.prefetch_related('...')

#Load only what you need
Product.objects.only('title')
Product.objects.defer('description')

# User Values if you dont need a django model like creating deleting updating then use this
Product.objects.values() # dict
Product.objects.values_list() # list

# Count properly
Product.objects.count()
len(Product.objects.all()) #### XXX BAD XXXX #####

# Bulk create/update for multiple objects
Product.objects.bulk_create()


# 2. Re-write the query
# 3. Tune the database
# 4. Cache the result
# 5. upgrade server
