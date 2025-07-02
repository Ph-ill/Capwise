import React, { useEffect, useState, useContext, useRef } from 'react';
import { Box, Typography, Container, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { MovieContext } from '../context/MovieContext';
import { themes } from '../themes';

const generatePastelColors = (numColors) => {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const hue = (i * 360) / numColors;
    colors.push(`hsl(${hue}, 70%, 80%)`);
  }
  return colors;
};

const Infographic = () => {
  const { profileName } = useContext(MovieContext);
  const [tasteProfile, setTasteProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [directorKeyData, setDirectorKeyData] = useState([]);
  const [writerKeyData, setWriterKeyData] = useState([]);
  const [actorKeyData, setActorKeyData] = useState([]);
  const genreChartRef = useRef(null);
  const directorChartRef = useRef(null);
  const writerChartRef = useRef(null);
  const actorChartRef = useRef(null);
  const timelineChartRef = useRef(null);
  

  const currentThemeIndex = parseInt(localStorage.getItem('selectedThemeIndex') || '0', 10);
  const activeTheme = themes[currentThemeIndex];

  useEffect(() => {
    const fetchTasteProfile = async () => {
      if (!profileName) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/users/taste-profile/${profileName}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTasteProfile(data.tasteProfile);
      } catch (e) {
        console.error("Error fetching taste profile:", e);
        setError("Failed to load taste profile. Please ensure the backend is running and you have interacted with some movies.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasteProfile();
  }, [profileName]);

  useEffect(() => {
    if (tasteProfile) {
      if (genreChartRef.current) drawBarChart(genreChartRef.current, tasteProfile.genres, "Top Genres", activeTheme);
      if (directorChartRef.current) {
        const data = drawPieChart(directorChartRef.current, tasteProfile.directors, "Top Directors", activeTheme);
        setDirectorKeyData(data);
      }
      if (writerChartRef.current) {
        const data = drawPieChart(writerChartRef.current, tasteProfile.writers, "Top Writers", activeTheme);
        setWriterKeyData(data);
      }
      if (actorChartRef.current) {
        const data = drawPieChart(actorChartRef.current, tasteProfile.actors, "Top Actors", activeTheme);
        setActorKeyData(data);
      }
      if (timelineChartRef.current) {
        const decadeData = Object.entries(tasteProfile.releaseYears || {}).reduce((acc, [year, score]) => {
          const parsedYear = parseInt(year);
          if (!isNaN(parsedYear)) {
            const decade = Math.floor(parsedYear / 10) * 10;
            if (!acc[decade]) {
              acc[decade] = { totalScore: 0, count: 0 };
            }
            acc[decade].totalScore += score;
            acc[decade].count++;
          }
          return acc;
        }, {});

        const timelineData = Object.entries(decadeData)
          .map(([decade, { totalScore, count }]) => [parseInt(decade), totalScore / count])
          .sort(([a], [b]) => a - b);

        console.log("Timeline Data:", timelineData);
        console.log("Decade Data:", decadeData);
        drawTimeline(timelineChartRef.current, timelineData, "Movies by Decade", activeTheme);
      }
    }
  }, [tasteProfile, activeTheme]);

  const drawBarChart = (canvas, data, title, theme, maxItems = 10) => {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const primaryColor = theme.theme.palette.primary.main;
    const textColor = theme.theme.palette.text.primary;

    const sortedData = Object.entries(data || {}).sort(([, a], [, b]) => b - a).slice(0, maxItems);
    if (sortedData.length === 0) {
      ctx.font = `16px ${theme.theme.typography.fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.fillText(`No ${title.toLowerCase()} data available yet.`, canvas.width / 2, canvas.height / 2);
      return;
    }

    const chartHeight = canvas.height - 100; // Adjusted for title and labels
    const barWidth = 40;
    const spacing = 20;
    const startX = 50;
    const maxValue = Math.max(...sortedData.map(([, score]) => Math.abs(score)));

    ctx.font = `18px ${theme.theme.typography.fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';

    sortedData.forEach(([label, score], index) => {
      const barHeight = (Math.abs(score) / maxValue) * chartHeight * 0.8; // Scale to 80% of chart height
      const x = startX + index * (barWidth + spacing);
      const y = canvas.height - 100 - barHeight; // Position from bottom

      ctx.fillStyle = score >= 0 ? primaryColor : theme.theme.palette.error.main;
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.font = `12px ${theme.theme.typography.fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.save();
      ctx.translate(x + barWidth / 2, canvas.height - 80);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      ctx.fillText(label, 0, 0);
      ctx.restore();

      ctx.fillText(score, x + barWidth / 2, y - 5);
    });
  };

  const drawPieChart = (canvas, data, title, theme, maxItems = 10) => {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const textColor = theme.theme.palette.text.primary;

    const sortedData = Object.entries(data || {}).sort(([, a], [, b]) => b - a).slice(0, maxItems);
    if (sortedData.length === 0) {
      ctx.font = `16px ${theme.theme.typography.fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.fillText(`No ${title.toLowerCase()} data available yet.`, canvas.width / 2, canvas.height / 2);
      return;
    }

    const totalScore = sortedData.reduce((sum, [, score]) => sum + Math.abs(score), 0);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.72;
    let startAngle = -Math.PI / 2;

    ctx.font = `18px ${theme.theme.typography.fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';

    const colors = generatePastelColors(sortedData.length);
    const keyData = [];

    sortedData.forEach(([label, score], index) => {
      const sliceAngle = (Math.abs(score) / totalScore) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.fillStyle = colors[index];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      // Draw label with line
      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 1.1;
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);
      const textX = centerX + (labelRadius + 10) * Math.cos(midAngle);
      const textY = centerY + (labelRadius + 10) * Math.sin(midAngle);

      ctx.beginPath();
      ctx.moveTo(centerX + radius * Math.cos(midAngle), centerY + radius * Math.sin(midAngle));
      ctx.lineTo(labelX, labelY);
      ctx.strokeStyle = textColor;
      ctx.stroke();

      ctx.font = `12px ${theme.theme.typography.fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = midAngle > Math.PI / 2 || midAngle < -Math.PI / 2 ? 'right' : 'left';
      ctx.fillText(label, textX, textY);

      startAngle = endAngle;

      keyData.push({
        label,
        color: colors[index],
        percentage: ((Math.abs(score) / totalScore) * 100).toFixed(1) + '%',
      });
    });
    return keyData;
  };

  const drawTimeline = (canvas, data, title, theme) => {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const textColor = theme.theme.palette.text.primary;
    const primaryColor = theme.theme.palette.primary.main;

    const sortedDecades = data;
    console.log("drawTimeline - sortedDecades:", sortedDecades);

    if (sortedDecades.length === 0) {
      ctx.font = `16px ${theme.theme.typography.fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.fillText(`No movie data by decade available yet.`, canvas.width / 2, canvas.height / 2);
      return;
    }

    const padding = 60;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2; // Adjusted to use full height minus padding
    const minDecade = sortedDecades.length > 0 ? sortedDecades[0][0] : 0;
    const maxDecade = sortedDecades.length > 0 ? sortedDecades[sortedDecades.length - 1][0] : minDecade; // If only one decade, maxDecade is minDecade
    const maxScore = Math.max(...sortedDecades.map(([, score]) => score)); // Max score will be the top of the chart
    const decadeRange = maxDecade - minDecade;

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = textColor;
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw labels and points
    ctx.fillStyle = textColor;
    ctx.font = `12px ${theme.theme.typography.fontFamily}`;

    ctx.beginPath();
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;

    const points = sortedDecades.map(([decade, score]) => {
      const x = padding + (decadeRange === 0 ? 0 : ((decade - minDecade) / decadeRange)) * chartWidth;
      const y = (canvas.height - padding) - (score / maxScore) * chartHeight; // Scale from 0 to maxScore
      return { x, y, decade, score };
    });

    if (points.length > 0) {
      ctx.moveTo(points[0].x, points[0].y);

      const tension = 0.2; // Increased for more curve

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];

        // Get surrounding points for control point calculation
        const prevP = (i > 0) ? points[i - 1] : p0; // If first point, use itself as previous
        const nextP = (i < points.length - 2) ? points[i + 2] : p1; // If last point, use itself as next

        // Calculate control points for cubic Bezier
        const cp1X = p0.x + (p1.x - prevP.x) * tension;
        const cp1Y = p0.y + (p1.y - prevP.y) * tension;

        const cp2X = p1.x - (nextP.x - p0.x) * tension;
        const cp2Y = p1.y - (nextP.y - p0.y) * tension;

        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, p1.x, p1.y);
      }
    }
    ctx.stroke();

    // Fill the area below the line
    if (points.length > 0) {
      ctx.lineTo(points[points.length - 1].x, canvas.height - padding);
      ctx.lineTo(points[0].x, canvas.height - padding);
      ctx.closePath();
      ctx.fillStyle = primaryColor + "33"; // Add some transparency
      ctx.fill();
    }

    // Draw labels (points are removed)
    ctx.fillStyle = textColor;
    ctx.font = `12px ${theme.theme.typography.fontFamily}`;
    points.forEach(point => {
      ctx.textAlign = 'center';
      ctx.fillText(point.decade + 's', point.x, canvas.height - padding + 20);
    });

    // Add axis labels
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, 30);
    ctx.save();
    ctx.translate(padding / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Preference Score', 0, 0);
    ctx.restore();
  };

  

  

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading your taste profile...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Container>
    );
  }

  if (!tasteProfile || tasteProfile.interactionCounts.total < 25) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Rate at least 25 movies to generate your personalized taste infographic!</Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>You have rated {tasteProfile ? tasteProfile.interactionCounts.total : 0} movies so far.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: activeTheme.theme.palette.text.primary, mb: 4 }}>
        Your Movie Taste Profile
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: activeTheme.theme.palette.background.paper }}>
        <Typography variant="h5" gutterBottom sx={{ color: activeTheme.theme.palette.text.primary }}>
          Interaction Statistics
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', mt: 2 }}>
          {Object.entries(tasteProfile.interactionCounts).map(([key, value]) => (
            <Box key={key} sx={{ textAlign: 'center', m: 1, p: 1, border: '1px solid', borderColor: activeTheme.theme.palette.divider, borderRadius: '8px', minWidth: '120px' }}>
              <Typography variant="h6" sx={{ color: activeTheme.theme.palette.primary.main }}>{value}</Typography>
              <Typography variant="body2" sx={{ color: activeTheme.theme.palette.text.secondary }}>{key.replace(/_/g, ' ').toUpperCase()}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: activeTheme.theme.palette.background.paper }}>
        <Typography variant="h5" gutterBottom sx={{ color: activeTheme.theme.palette.text.primary }}>
          Genre Preferences
        </Typography>
        <Box sx={{ width: '100%', height: '350px' }}>
          <canvas ref={genreChartRef} style={{ width: '100%', height: '100%' }}></canvas>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: activeTheme.theme.palette.background.paper }}>
        <Typography variant="h5" gutterBottom sx={{ color: activeTheme.theme.palette.text.primary }}>
          Top Directors
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            {directorKeyData.length > 0 && (
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Color</TableCell>
                      <TableCell>Director</TableCell>
                      <TableCell>Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {directorKeyData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell><Box sx={{ width: 20, height: 20, bgcolor: item.color }} /></TableCell>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{item.percentage}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
          <Box sx={{ width: '100%', height: '350px', flex: 2 }}>
            <canvas ref={directorChartRef} style={{ width: '100%', height: '100%' }}></canvas>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: activeTheme.theme.palette.background.paper }}>
        <Typography variant="h5" gutterBottom sx={{ color: activeTheme.theme.palette.text.primary }}>
          Top Writers
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            {writerKeyData.length > 0 && (
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Color</TableCell>
                      <TableCell>Writer</TableCell>
                      <TableCell>Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {writerKeyData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell><Box sx={{ width: 20, height: 20, bgcolor: item.color }} /></TableCell>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{item.percentage}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
          <Box sx={{ width: '100%', height: '350px', flex: 2 }}>
            <canvas ref={writerChartRef} style={{ width: '100%', height: '100%' }}></canvas>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: activeTheme.theme.palette.background.paper }}>
        <Typography variant="h5" gutterBottom sx={{ color: activeTheme.theme.palette.text.primary }}>
          Top Actors
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            {actorKeyData.length > 0 && (
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Color</TableCell>
                      <TableCell>Actor</TableCell>
                      <TableCell>Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {actorKeyData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell><Box sx={{ width: 20, height: 20, bgcolor: item.color }} /></TableCell>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{item.percentage}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
          <Box sx={{ width: '100%', height: '350px', flex: 2 }}>
            <canvas ref={actorChartRef} style={{ width: '100%', height: '100%' }}></canvas>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ mb: 4, bgcolor: activeTheme.theme.palette.background.paper }}>
        <Typography variant="h5" gutterBottom sx={{ p: 3, color: activeTheme.theme.palette.text.primary }}>
          Movies by Decade
        </Typography>
        <Box sx={{ width: '100%', height: '350px', p: 3 }}>
          <canvas ref={timelineChartRef} style={{ width: '100%', height: '100%' }}></canvas>
        </Box>
      </Paper>
    </Container>
  );
};

export default Infographic;