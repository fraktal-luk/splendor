
analyze

% recreateScoring % may be needed to fix incorrect valueVector

process_stats

% plots

find_guesses

%browse_beginning

browse_16_18(stepValues, followerMat, gv18, valueVector);

% dominant(s) is a state whose value spreads to s by backtracing
[dv, dominants] = diffuseValuesQuick_Src(valueVector, followerMat, moves, finals);




% Calculate per state: how influential is it - the higher influence, the
% earlier step has it as the dominant
earliestStep = nan(1, nStates);
earliestState = nan(1, nStates);
for s = 1:nStates
    src = dominants(s);
    if isnan(src)
        continue
    end
    earliestStep(src) = min(earliestStep(src), stepValues(s));
    earliestState(src) = min(earliestState(src), s);
end


% quiver(1:nStates, arrowY, 0*arrowY, (1:nStates) - arrowY,  0, 'k', 'ShowArrowHead', 'off')
plot(1:nStates, stepValues, 'k')
hold on
plot(1:nStates, earliersStep, 'k')
