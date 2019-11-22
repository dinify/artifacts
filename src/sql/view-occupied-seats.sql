select * from seats
where table_id in (
	select id
	from `tables`
	where waiterboard_id in (
		select id
		from waiterboards
		where restaurant_id="5oeaCN0NxATLP4LLcTjhgq" --Choptix
)
and occupied=1