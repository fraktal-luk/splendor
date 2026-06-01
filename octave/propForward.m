
function values = propForward(valuesIn, followerMat, func, initialList)

        visited = false(size(valuesIn));

    values = valuesIn;

    wave = initialList;
    
    iter = 0;

    while true
            visited(wave) = true;%visited(wave) + 1;

        if isempty(wave)
            break
        end

            if iter > 26
                break
            end

        iter = iter + 1;

            
            disp(numel(wave))

            %disp((max(visited)))
            % 
            % for x = 1:numel(wave)
            %     thisId = wave(x);
            %     followers = getFollowers(thisId, followerMat);
            %     for y = 1:numel(followers)
            %         values(followers(y)) = func(values(followers(y)), values(thisId));
            %     end
            % end




        waveNext = arrayfun(@(x)getFollowers(x, followerMat), wave, 'UniformOutput', false);
        wave = unique([waveNext{:}]);
        
        wave(visited(wave)) = [];

            % % Check if this new wave has something already visited 
            % if any(visited(wave))
            %     fprintf('already visited in new wave: %d', nnz(visited(wave)))
            % end
    end

end


function followers = getFollowers(id, followerMat)
    followersAll = followerMat(:, id);
    followers = followersAll(~isnan(followersAll))';
end
