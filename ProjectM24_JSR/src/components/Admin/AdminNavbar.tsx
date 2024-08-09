import React, { useEffect } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { Article as ArticleIcon, Person as PersonIcon, Group as GroupIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getAllUsers } from '../../service/Login-Register/User';
import { getAllPost } from '../../service/Login-Register/Post';
import { allGroups } from '../../service/Login-Register/Group';


const AdminNavbar = () => {
    const dispatch=useDispatch()

    const users= useSelector((state:RootState)=> state.users.users)
    const posts=useSelector((state:RootState)=>state.post.post)
    const groups=useSelector((state:RootState)=>state.group.groups)
    
    useEffect(()=>{
       dispatch(getAllUsers())    
       dispatch(getAllPost())
       dispatch(allGroups())

    },[])


  const stats = [
    { title: "Total Posts", value: posts.length, icon: ArticleIcon, color: '#2196f3' },
    { title: "Total Users", value: users.length, icon: PersonIcon, color: '#ff9800' },
    { title: "Total Groups", value: groups.length, icon: GroupIcon, color: '#e91e63' },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={4} key={index}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Box
              sx={{
                bgcolor: `${stat.color}15`,
                borderRadius: '8px',
                p: 1,
                display: 'flex',
                mr: 2,
              }}
            >
              <stat.icon sx={{ color: stat.color, fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {stat.title}
              </Typography>
              <Typography variant="h6" component="div" fontWeight="bold">
                {stat.value.toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default AdminNavbar;