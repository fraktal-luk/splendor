
% dominant(s) is a state whose value spreads to s by backtracing
% valueVector(dominant(s)) == valueVector(s) by definition
[dv, dominants] = diffuseValuesQuick_Src(valueVector, followerMat, moves, finals);


% Calculate per state: how influential is it - the higher influence, the
% earlier step has it as the dominant
earliestSteps = nan(1, nStates);
earliestStates = nan(1, nStates);
for s = 1:nStates
    src = dominants(s);
    if isnan(src)
        continue
    end
    earliestSteps(src) = min(earliestSteps(src), stepValues(s));
    earliestStates(src) = min(earliestStates(src), s);
end


% Skeleton: remove nodes so that the overall result is unchanged
% So, because player 0 is winning:
% - for mover 0, the optimal move is chosen
% - for mover 1, all moves are chosen because if it loses, any following '1' change would
%   make it '1' and 'U' would turn it to 'U'
% Apply this to followerMat, removing unneeded links
% 

skel = findSkeleton(followerMat, valueVector, moves);

