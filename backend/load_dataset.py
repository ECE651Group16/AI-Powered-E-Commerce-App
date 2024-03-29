import pandas as pd
from pyarrow import json
import MySQLdb
from faker import Faker
import random
from tqdm import tqdm

from storefront.settings.dev import DATABASES

user_limit = 10000

if __name__ == '__main__':
    meta_table = pd.read_json(path_or_buf='amazon_dataset/meta_CDs_and_Vinyl.jsonl', lines=True)
    table = json.read_json('amazon_dataset/CDs_and_Vinyl.jsonl')
    table = table.to_pandas()

    product_count = len(meta_table)

    asin_code, asin_uniques = pd.factorize(pd.concat([meta_table['parent_asin'], table['parent_asin']]))
    user_code, user_uniques = pd.factorize(table['user_id'])

    table['new_user_id'] = user_code
    meta_table['new_parent_asin'] = asin_code[:product_count]
    table['new_parent_asin'] = asin_code[product_count:]

    limit_table = table[table['new_user_id'] < user_limit]
    del table

    with MySQLdb.connect(host=DATABASES['default']['HOST'],
                         user=DATABASES['default']['USER'],
                         password=DATABASES['default']['PASSWORD'],
                         database=DATABASES['default']['NAME']) as db:

        cur = db.cursor()
        fake = Faker()

        for i in tqdm(range(user_limit)):
            id = f'{i + 1}'
            password = '12345678'
            is_superuser = 0
            username = fake.user_name() + f'_{i + 1}'
            first_name = fake.first_name()
            last_name = fake.last_name()
            is_staff = '0'
            is_active = '1'
            date_joined = fake.date_time_this_decade()
            last_login = fake.date_time_this_month()
            while last_login < date_joined:
                last_login = fake.date_time_this_month()
            email = f'{i + 1}@1.com'
            cur.execute(
                "INSERT INTO core_user(id, password, last_login, is_superuser, username, first_name, last_name, is_staff, is_active, date_joined, email) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                (id,
                 password,
                 last_login,
                 is_superuser,
                 username,
                 first_name,
                 last_name,
                 is_staff,
                 is_active,
                 date_joined,
                 email))

        for i in tqdm(range(user_limit)):
            id = f'{i + 1}'
            phone = fake.phone_number()
            birth_date = fake.date_of_birth()
            membership = random.choice(['B', 'S', 'G'])
            user_id = f'{i + 1}'
            cur.execute(
                "INSERT INTO store_customer(id, phone, birth_date, membership, user_id) VALUES (%s,%s,%s,%s,%s)",
                (id,
                 phone,
                 birth_date,
                 membership,
                 user_id))

        new_asin_code, new_asin_uniques = pd.factorize(limit_table['new_parent_asin'])
        limit_table['new_parent_asin2'] = new_asin_code

        query = "INSERT INTO store_collection(id, title) VALUES ('1', 'CD')"
        cur.execute(query)

        for i in tqdm(range(len(new_asin_uniques))):
            product = meta_table[meta_table['new_parent_asin'] == new_asin_uniques[i]].iloc[0]

            id = f'{i + 1}'
            title = product['title'].encode("ascii", errors="ignore").decode()[:255]
            slug = f'{i + 1}'
            description = product['description']
            if not description:
                description = ' '.join(fake.words(10))
            else:
                description = description[0].encode("ascii", errors="ignore").decode()
            unit_price = product['price']
            if not unit_price:
                unit_price = 0.01
            if type(unit_price) != float:
                unit_price = 0.01
            inventory = random.randint(1, 1000)
            total_sells = meta_table[meta_table['new_parent_asin'] == new_asin_uniques[i]].iloc[0]['rating_number']
            last_update = fake.date_time_this_year()
            collection_id = '1'
            cur.execute(
                'INSERT INTO store_product(id, title, slug, description, unit_price, inventory, total_sells, last_update, collection_id) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)',
                (id,
                 title,
                 slug,
                 description,
                 unit_price,
                 inventory,
                 total_sells,
                 last_update,
                 collection_id))

        for i in tqdm(range(len(limit_table))):
            id = f'{i + 1}'
            placed_at = fake.date_time_this_year()
            payment_status = "C"
            customer_id = limit_table.iloc[0]['new_user_id'] + 1
            cur.execute('INSERT INTO store_order(id, placed_at, payment_status, customer_id) VALUES(%s,%s,%s,%s)',
                        (id,
                         placed_at,
                         payment_status,
                         customer_id))

        for i in tqdm(range(len(limit_table))):
            product_id = limit_table.iloc[i]['new_parent_asin2']
            product = meta_table[meta_table['new_parent_asin'] == new_asin_uniques[product_id]].iloc[0]

            id = f'{i + 1}'
            quantity = 1
            unit_price = product['price']
            if not unit_price:
                unit_price = 0.01
            if type(unit_price) != float:
                unit_price = 0.01
            order_id = f'{i + 1}'
            product_id += 1
            cur.execute(
                'INSERT INTO store_orderitem(id, quantity, unit_price, order_id, product_id) VALUES(%s,%s,%s,%s,%s)',
                (id,
                 quantity,
                 unit_price,
                 order_id,
                 product_id))

        db.commit()
