delete from menu_item_translations
where locale not in (
  select `language`
	from menu_languages 
	where restaurant_id in (
		select restaurant_id
		from menu_categories
		where id in (
			select menu_category_id
			from menu_items
			where id=menu_item_id
		)
	)
	and `default`=1
)