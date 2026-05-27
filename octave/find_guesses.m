
diffRanges24 = diffuseValuesRange(valueVector, followerMat, moves, finals, [-inf; inf]);

plotRanges24 = min(30, max(-30, diffRanges24));


[~, LABELS_R] = groupSteps(stepValues, makeDisplayValues(valueVector), plotRanges24);

rangesSortedByStep(:, LABELS_R) = plotRanges24;
valuesByLABELS(LABELS_R) = valueVector;

categs = categorizeOnce(valueVector, followerMat, moves);
categsByLABELS(LABELS_R) = categs;

finalsByLABELS(LABELS_R) = finals;

%stepsOptByLABELS(LABELS_R) = stepsOpt;

diffsByLABELS(LABELS_R) = diffVector;




