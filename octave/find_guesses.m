
% Make simple predictions for unknown nodes
tic
diffRanges18 = diffuseValuesRange(gv18', followerMat, moves, finals18);
toc

tic
diffRanges20 = diffuseValuesRange(gv20', followerMat, moves, finals20);
toc

tic
diffRanges22 = diffuseValuesRange(gv22', followerMat, moves, finals22);
toc

tic
diffRanges24 = diffuseValuesRange(gv24', followerMat, moves, finals24);
toc

plotRanges24 = min(30, max(-30, diffRanges24));

% 0 wins: lower bound > 0
% 1 wins: higher bound < 0
% draw: range == [0; 0]
% 

haveUpper = diffRanges24(2,:) < inf;
haveLower = diffRanges24(1,:) > -inf;
draws = all(diffRanges24 == 0);
wins0 = diffRanges24(1,:) > 0;
wins1 = diffRanges24(2,:) < 0;
swing = haveUpper & haveLower & ~wins0 & ~wins1 & ~draws;
dark = ~haveUpper & ~haveLower;





