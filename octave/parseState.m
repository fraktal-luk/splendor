
function retval = parseState(str)

table = str(1:4);
p0 = str(5:12);
p1 = str(13:20);

p0owned = single(p0(3:end)' - '0');
p0pts = single(p0(1));
p0all = single(p0(2));

p1owned = single(p1(3:end)' - '0');
p1pts = single(p1(1));
p1all = single(p1(2));

player0 = struct('points', p0pts, 'sum', p0all, 'cards', p0owned);
player1 = struct('points', p1pts, 'sum', p1all, 'cards', p1owned);


retval = struct( ...
  'rowIds', table(1:3)',        ...
  'moves', table(4),            ...
  'players', [player0, player1] ...
);

end
