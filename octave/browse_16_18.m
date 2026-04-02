function browse_16_18(stepValues, followerMat, gv18, valueVector)
% Let's see how the first batch of finals (step 18) is backpropagated

% Could be taken from gt!
states15 = find(stepValues == 15);
states16 = find(stepValues == 16);
states17 = find(stepValues == 17);
states18 = find(stepValues == 18);

% gv18      - values known from steps up to 18
% finals18  - which in step 18 are final

% backprop 17 <- 18
% 
% mainSuccessors = nan(1, numel(states17));
% mainSuccValues = nan(1, numel(states17));
% tempSuccessors = nan(1, numel(states17)); % those that are known but not wanted (suppressed by U)
% tempSuccValues = nan(1, numel(states17));


%[ms, msv, ts, tsv, newValues] = backtrackOneStep(states17, states18, followerMat, gv18, 1);
%[ms16, msv16, ts16, tsv16, newValues16] = backtrackOneStep(states16, states17, followerMat, newValues, 0);
%[ms15, msv15, ts15, tsv15, newValues15] = backtrackOneStep(states15, states16, followerMat, newValues, 1);



%% Idea: main follower
%       It is the follower that determines value (optimal choice). Optimal
%       choices may be multiple but let's choose just one to reduce set
%       size
%       If a node is U, it has no main follower (all are equal?)
%       So:
%           a defined valued node has a main follower (only one, and equal in value) and cold followers
%           an U value node has hot followers (U values) and cold followers (not U values)
%           

[mf17, uh17, ah17] = findMainFollowers(states17, followerMat, valueVector);
[mf16, uh16, ah16] = findMainFollowers(states16, followerMat, valueVector);
[mf15, uh15, ah15] = findMainFollowers(states15, followerMat, valueVector);

nf17 = sum(cellfun(@numel, uh17));
nf16 = sum(cellfun(@numel, uh16));
nf15 = sum(cellfun(@numel, uh15));

ns = [numel(states15), numel(states16), numel(states17), numel(states18)];
nu = [0, numel(ah15), numel(ah16), numel(ah17)];
nf = [0, nf15, nf16, nf17];


numS = nan(1, 24);
numA = nan(1, 24);
numH = nan(1, 24);
numUH = nan(1, 24);

for s = 1:20
    statesS = find(stepValues == s);
    [mainArr, followersHot, followersUnique] = findMainFollowers(statesS, followerMat, valueVector);
    numS(s) = numel(statesS);
    numA(s+1) = nnz(~isnan(followerMat(:, statesS)));
    numH(s+1) = sum(cellfun(@numel, followersHot));
    numUH(s+1) = numel(followersUnique);
end


plot(numS, 'b')
hold on
plot(numA, 'g')
plot(numH, 'r')
plot(numUH, 'k')

1;

end


function [mainRes, uhot, ahot] = findMainFollowers(statesFrom, followerMat, values)
    mainRes = nan(1, numel(statesFrom));
    uhot = cell(1, numel(statesFrom));

    for i = 1:numel(mainRes)
        s = statesFrom(i);
        followers = followerMat(:, s);
        followers(isnan(followers)) = [];

        if isempty(followers)
            uhot{i} = [];
            continue;
        end

        if ~isnan(values(s))
            ind = find(values(followers) == values(s), 1);
            mainRes(i) = followers(ind);
            uhot{i} = followers(ind);
        else
            uhot{i} = followers(isnan(values(followers)))';
        end
    end

    ahot = unique(cell2mat(uhot));
end
