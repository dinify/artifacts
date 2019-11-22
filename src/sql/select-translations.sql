select *
from (
  select item_id, item_type, count(locale) as translation_count
  from (
    select addon_id as item_id, "addon" as item_type, locale
    from addon_translations
    union all
    select choice_id as item_id, "choice" as item_type, locale
    from choice_translations
    union all
    select ingredient_id as item_id, "ingredient" as item_type, locale
    from ingredient_translations
    union all
    select menu_category_id as item_id, "menu_category" as item_type, locale
    from menu_category_translations
    union all
    select menu_item_id as item_id, "menu_item" as item_type, locale
    from menu_item_translations
    union all
    select option_id as item_id, "option" as item_type, locale
    from option_translations
    union all
    select service_id as item_id, "service" as item_type, locale
    from service_translations
  ) as translations_
  group by item_id, item_type
  order by item_type
) as translations
where item_type="menu_item" and translation_count!=1
or item_type!="menu_item" and translation_count!=40
