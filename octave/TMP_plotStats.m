function TMP_plotStats(statsTb)
    hold on

    plot(statsTb.visited, 'k')    
    plot(statsTb.active, 'r')

    stem(statsTb.visited, 'k')    
    stem(statsTb.active, 'r')
    
    stem(statsTb.selected, 'g')
    stem(statsTb.solved, 'b')
end
