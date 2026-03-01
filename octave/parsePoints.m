function [moves, p0, p1] = parsePoints(strings)

% table = str(1:4);
% p0 = str(5:12);
% p1 = str(13:20);
% 
% p0owned = single(p0(3:end)' - '0');
% p0pts = single(p0(1));
% p0all = single(p0(2));
% 
% p1owned = single(p1(3:end)' - '0');
% p1pts = single(p1(1));
% p1all = single(p1(2));

moves = strings(4, :);
p0 = single(strings(5, :));
p1 = single(strings(13, :));

end