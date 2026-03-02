function [finals, tips, branching] = getCategs(points0, points1, valueVector, moves, dataMat)
    TH = 10; % TODO: parameter

    finals = (moves == 0) & max(points0, points1) >= TH;
    tips = isnan(valueVector(1:numel(points0)))' & all(isnan(dataMat), 1);
    
    branching = sum(~isnan(dataMat));
end