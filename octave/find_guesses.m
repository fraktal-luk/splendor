
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

tic
diffRanges24 = diffuseValuesRange(gv24', followerMat, moves, finals24, [-inf; inf]);
toc

plotRanges24 = min(30, max(-30, diffRanges24));


% 0 wins: lower bound > 0
% 1 wins: higher bound < 0
% draw: range == [0; 0]
haveUpper = diffRanges24(2,:) < inf;
haveLower = diffRanges24(1,:) > -inf;
    
    onlyUpper = haveUpper & ~haveLower; % 
    onlyLower = haveLower & ~haveUpper;
    haveAny = haveUpper | haveLower;
    haveBoth = haveUpper & haveLower;
    haveNone = ~haveUpper & ~haveLower;

draws = all(diffRanges24 == 0);

wins0 = diffRanges24(1,:) > 0;
    wins0bound = wins0 & haveUpper;
    wins0unbound = wins0 & ~haveUpper;

negBound = haveLower & ~wins0; 

wins1 = diffRanges24(2,:) <= 0;
    wins1bound = wins1 & haveLower;
    wins1unbound = wins1 & ~haveLower;

posBound = haveUpper & ~wins1;

% negBound and posBound can overlap!

swing = haveBoth & ~wins0 & ~wins1 & ~draws;
dark = haveNone;

suspect = (unknown & haveAny); % unknown but a limit

% which nodes don't have non-NaN followers?
diffOnce = diffuseValuesOnce(valueVector, followerMat, moves);
hardU = isnan(diffOnce); % these nodes don't have any 0/D/1 direct followers

% # hardU doesn't mean that range is [-inf; inf]
% # range [-inf; inf] doesn't mean that everything in forward cone is U

% Sort ranges in a given step by max and min:
prOrig = plotRanges24(:, stepValues == 12);
pr = [prOrig; 1:width(prOrig)]'; % append index vector to get sorted order easily

ps1 = sortrows(pr, 1);
ps2 = sortrows(ps1, 2);

pv2 = ps2(:,1:2);
ord = ps2(:, 3);
pv2_comp = prOrig(:, ord)';

[gtR, LABELS_R] = groupSteps(stepValues, makeDisplayValues(valueVector), plotRanges24);

rangesSortedByStep(:, LABELS_R) = plotRanges24;
%rangesVSortedByStep(:, LABELS) = plotRanges24;
valuesByLABELS(LABELS_R) = valueVector;

categs = categorizeOnce(valueVector, followerMat, moves);
categsByLABELS(LABELS_R) = categs;
