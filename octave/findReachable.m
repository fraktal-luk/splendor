
% Traverse tree with assumption that player1 does only optimal moves
function reached = findReachable(followerMat, optimals, states)

reached = false(1, numel(states));

reached(1) = true;

for i = 1:numel(reached)
  if (~reached(i)); continue; end     % for player0 only those paths that adversary allows

  mover = states{i}.moves;
  if mover == 1
    nextAll = followerMat(:, i);
    next = nextAll(optimals(:, i));
  else

    next = followerMat(:, i);
  end

  next = next(next <= numel(states) & next > 0);

  reached(next) = true;
end

end
