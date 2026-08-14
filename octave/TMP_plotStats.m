function TMP_plotStats(statsTb)

   % hold on
    % stairs(statsTb.minPointA, 'b')
    % stairs(statsTb.maxPointA, 'b')
    % stairs(statsTb.minStepA, 'r')
    % stairs(statsTb.maxStepA, 'r')
    %stairs(log(statsTb.visited), 'g')

    hold on

    plot(statsTb.visited, 'k')    
    plot(statsTb.active, 'r')

    stem(statsTb.visited, 'k')    
    stem(statsTb.active, 'r')
    
    stem(statsTb.selected, 'g')
    stem(statsTb.solved, 'b')

end
