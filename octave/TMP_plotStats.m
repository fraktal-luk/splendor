function TMP_plotStats(statsTb)

    hold on
    stairs(statsTb.minPointA, 'b')
    stairs(statsTb.maxPointA, 'b')
    stairs(statsTb.minStepA, 'r')
    stairs(statsTb.maxStepA, 'r')
    stairs(log(statsTb.visited), 'g')
end
