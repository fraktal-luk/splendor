
function [mainSuccessors, mainSuccValues, tempSuccessors, tempSuccValues, newValues] = ...
            backtrackOneStep(statesFrom, statesTo, followerMat, gameValues, mover)
    newValues = gameValues;

    mainSuccessors = nan(1, numel(statesFrom));
    mainSuccValues = nan(1, numel(statesFrom));
    tempSuccessors = nan(1, numel(statesFrom)); % those that are known but not wanted (suppressed by U)
    tempSuccValues = nan(1, numel(statesFrom));
    
    % argsL states17, states18, followerMat, gv18
    % outs: mainSuccesors, mainSuccValues, tempSuccessors, tempSuccValues
    for ind = 1:numel(statesFrom)
        followers = followerMat(:, statesFrom(ind));
        fselect = ismember(followers, statesTo);
        followers = followers(fselect);
    
        fVals = gameValues(followers);
    
        if isempty(fVals)
            % nothing
        else
            hasUF = any(isnan(fVals));
            
            if mover == 1
                [what, where] = min(fVals); % minimum because moves 1
                
                if what <= 0 % player 1 wants nonpositive
                    mainSuccessors(ind) = followers(where);
                    mainSuccValues(ind) = what;
                elseif what > 0 % losing?
                    if hasUF
                        tempSuccessors(ind) = followers(where);
                        tempSuccValues(ind) = what;
                    else
                        mainSuccessors(ind) = followers(where);
                        mainSuccValues(ind) = what;
                    end
                % else - only U? nothing happens
                end
            else
                [what, where] = max(fVals); % max because moves 0
                
                if what > 0 % player 0 wants positive
                    mainSuccessors(ind) = followers(where);
                    mainSuccValues(ind) = what;
                elseif what <= 0 % losing?
                    if hasUF
                        tempSuccessors(ind) = followers(where);
                        tempSuccValues(ind) = what;
                    else
                        mainSuccessors(ind) = followers(where);
                        mainSuccValues(ind) = what;
                    end
                % else - only U? nothing happens
                end
            end
        end
    end


    for ind = numel(statesFrom)
        newValues(statesFrom(ind)) = mainSuccessors(ind);
    end    
end