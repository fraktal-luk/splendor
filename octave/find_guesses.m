
% Make simple predictions for unknown nodes
% tic
% diffRanges18 = diffuseValuesRange(gv18', followerMat, moves, finals18, [-inf; inf]);
% toc
% 
% tic
% diffRanges20 = diffuseValuesRange(gv20', followerMat, moves, finals20, [-inf; inf]);
% toc
% 
% tic
% diffRanges22 = diffuseValuesRange(gv22', followerMat, moves, finals22, [-inf; inf]);
% toc


diffRanges24 = diffuseValuesRange(gv24', followerMat, moves, finals24, [-inf; inf]);

plotRanges24 = min(30, max(-30, diffRanges24));


wins0 = diffRanges24(1,:) > 0;
wins1 = diffRanges24(2,:) <= 0;

[~, LABELS_R] = groupSteps(stepValues, makeDisplayValues(valueVector), plotRanges24);

rangesSortedByStep(:, LABELS_R) = plotRanges24;
valuesByLABELS(LABELS_R) = valueVector;

categs = categorizeOnce(valueVector, followerMat, moves);
categsByLABELS(LABELS_R) = categs;

finalsByLABELS(LABELS_R) = finals;

    optimals = markOptimalMoves(valueVector, followerMat);
 
    reached = findReachable(followerMat, optimals, moves);

    initialStepsOpt = inf(1, numel(reached));
    initialStepsOpt(reached) = 0;
    
    % How many steps away from optimal path
    stepsOpt = countStepsGeneral(followerMat, initialStepsOpt);
    in4steps = stepsOpt <= 4;

stepsOptByLABELS(LABELS_R) = stepsOpt;

diffsByLABELS(LABELS_R) = diffVector;

gvl18(LABELS_R) = gv18;
gvl20(LABELS_R) = gv20;
gvl22(LABELS_R) = gv22;
gvl24(LABELS_R) = gv24;
