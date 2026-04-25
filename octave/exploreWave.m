function stats = exploreWave(followerMat, expInput, thr, mode)
    LIMIT = thr; %400 * 2 * 3;

        values = expInput.valueVector;
        moves = expInput.moves;
        finals = expInput.finals;
        ignored = expInput.tips;


    nIters = 100;

    active = false(1, width(followerMat));
    visited = false(1, width(followerMat));

    active(1) = 1;
    %initialState = 1;

   % wave = initialState;

    waveSizes = nan(1, nIters);
    waveSizesReduced = nan(1, nIters);

        vActive = nan(1, nIters);
        vNextActive = nan(1, nIters);
        vReduced = nan(1, nIters);
        vSelected = nan(1, nIters);
        vExpanded = nan(1, nIters);


    for i = 1:nIters
        selected = find(active);

        nActive = numel(selected);
            vActive(i) = nActive;

        % Selection process
        if nActive > LIMIT
            switch mode
                case 'newest'
                    selected = selected(end-LIMIT+1:end);
                case 'highV'
                    vals = values(selected);
                    [~, inds] = sort(-vals);
                    selected = selected(inds(1:LIMIT));
                        1;
                otherwise
                    selected = selected(1:LIMIT);
            end


            % if USE_NEWEST
            %     selected = selected(end-LIMIT+1:end);
            % else
            %     selected = selected(1:LIMIT);
            % end
        end

        nSelected = numel(selected);
            vSelected(i) = nSelected;

        % Move from selected tips: switch then from active to visited
        visited(selected) = 1;
        active(selected) = 0;

        moved = moveWave(selected, followerMat);
        waveNext = unique(cell2mat(moved));
        wave = waveNext;

        % Set newly discovered as active
            wave(visited(wave)) = [];
            active(wave) = 1;

        expandedSize = numel(wave);
        waveSizes(i) = expandedSize;
            vExpanded(i) = expandedSize;
            vReduced(i) = vActive(i);

         nActivePre = nnz(active);
            vNextActive(i) = nActivePre;

        if waveSizes(i) == 0
            fprintf('exhausted wave; active: %d\n', nnz(active))
            break
        end

        fprintf('active: %d\n', nnz(active))

        nActiveFinals = nnz(active & finals);
        
        if nActiveFinals == 0
            waveSizesReduced(i) = waveSizes(i);
            continue
        end    

        % Diffuse known values
        % ...
        initVals = nan(1, width(followerMat));
        initVals(active & finals) = values(active & finals);
        
        [diffusedVals] = diffuseValuesQuick(initVals, followerMat, moves, active & finals);

        nKnownVals = nnz(~isnan(diffusedVals));
            % disp([nActiveFinals, nKnownVals])


        % Propagate forward from solved nodes (only visited!), eliminate reached
        % ...
        solvedNew = subgraphFrom(find(~isnan(diffusedVals)), followerMat);



        active(solvedNew) = 0;

            nActiveNew = nnz(active);

        waveSizesReduced(i) = nActiveNew;
            vReduced(i) = nActiveNew;

        fprintf('active prev: %d, known %d, active new %d\n', [nActivePre, nKnownVals, nActiveNew])
    end

      %  disp(waveSizes)
      %  sum(waveSizes(~isnan(waveSizes)))

  stats.vActive = vActive;
  stats.vSelected = vSelected;
  stats.vExpanded = vExpanded;
  stats.vNextActive = vNextActive;
  stats.vReduced = vReduced;
  stats.nV = nnz(visited);
end


function newWave = moveWave(waveIn, followerMat)
    newWave = arrayfun(@(s) getFollowers(s, followerMat), waveIn, 'UniformOutput', false);
    
end


function followers = getFollowers(s, followerMat)
    next = followerMat(:, s);
    next = next(~isnan(next))';
    followers = next;
end
