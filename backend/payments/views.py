
import time
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from django.shortcuts import redirect
from rest_framework.views import APIView

import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentViewSet(APIView):
    def post(self, request):
        # subtotal = request.data.get('subtotal', 0)
        items = request.data.get('items', [])
        print("Received items from frontend:", items) 
        input_items = []
        for item in items:
            print("currency: ", item.get('currency'))
            print('name', item.get('name'))
            print('unit_amount', item.get('amount'))
            print('quantity', item.get('quantity'))
            input_items.append({'price_data': {
                        'currency': str(item.get('currency', 'cad')),  # Default currency to 'cad' if not provided
                        'product_data': {
                            'name': str(item.get('name', 'Unknown Product')),  # Default name if not provided
                        },
                        'unit_amount': int(item.get('amount')),  # Amount in cents
                    },
                    'quantity': int(item.get('quantity', 1)),})
        print("input_items:\n",input_items)
        
        YOUR_DOMAIN = "http://127.0.0.1:3000/"
        try:
            # product = Product.objects.get(pk=product)
            # product_image = product.images[0] if product.images.exists() else 'url_to_default_image'
            # amount_subtotal = 2198
            # amount_total = int(subtotal * 100)
            line_items = []

            # Construct the line_items list by iterating over items
            for item in items:
                line_item = {
                    'price_data': {
                        'currency': str(item.get('currency', 'cad')),  # Default to 'cad' if not provided
                        'product_data': {
                            'name': str(item.get('name', 'Unknown Product')),  # Default name if not provided
                        },
                        'unit_amount': int(item.get('amount', 0)),  # Ensure amount is an int, default to 0
                    },
                    'quantity': int(item.get('quantity', 1)),  # Ensure quantity is an int, default to 1
                }
                line_items.append(line_item)

            checkout_session = stripe.checkout.Session.create(
                line_items=line_items,
                #line_items=  [{'price_data': {'currency': 'cad', 'product_data': {'name': 'Potatoes - Yukon Gold 5 Oz'}, 'unit_amount': 1346}, 'quantity': 1}, {'price_data': {'currency': 'cad', 'product_data': {'name': 'Bite People Cat'}, 'unit_amount': 1000}, 'quantity': 5}],
                # line_items = [{
                #     'price_data': {
                #         'currency': str(item.get('currency', 'cad')),  # Default currency to 'cad' if not provided
                #         'product_data': {
                #             'name': str(item.get('name', 'Unknown Product')),  # Default name if not provided
                #         },
                #         'unit_amount': int(item.get('amount')),  # Amount in cents
                #     },
                #     'quantity': item.get('quantity', 1),  # Default quantity to 1 if not provided
                #     } for item in items],
                # line_items=[
                #     {
                #         # Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                #         # 'price': '{{PRICE_ID}}',
                #         #'price': 'price_1P1MAuLyCz9ytZLn4dZUIH3f',
                #         #     'currency': 'cad',
                #         #     'product_data': {
                #         #         'name': product.title,
                #         #         # 'images': [],
                #         #     },
                #         #     'unit_amount': int(product.unit_price * 100),
                #         # },
                #         'price_data': {
                #             'currency': 'cad',
                #             'product_data': {
                #                 'name': 'Your Product Name',
                #                 # Optionally, add an image
                #                 # 'images': [product_image],
                #             },
                #             # 'unit_amount': amount_total, # Assuming amount_total is in cents
                #         },
                #         'quantity': 1,
                #     },
                #],
                payment_method_types=['card'],
                mode='payment',
                success_url='http://localhost:3000/?success?session_id={CHECKOUT_SESSION_ID}',
                #success_url='http://localhost:3000/?success&session_id={CHECKOUT_SESSION_ID}',
                cancel_url='http://localhost:3000/?canceled=true',
                automatic_tax={'enabled': True},  # Enable or disable automatic tax calculation
                billing_address_collection='required',  # Set to 'required' to collect billing address
                shipping_options=[  # Use 'shipping_options' to specify shipping rates
                    {
                        'shipping_rate': 'shr_1P1h9kLyCz9ytZLnNjnm4TMt'
                    }
                ],
                shipping_address_collection={
                    'allowed_countries': ['US', 'CA'],  # Specify allowed countries for shipping
                },
                 allow_promotion_codes=True,  # This enables promotion code input
            )
            return redirect(checkout_session.url)
            # return JsonResponse({'sessionId': checkout_session['id']})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        # return JsonResponse({
        #     'id': checkout_session.id
        # })
        