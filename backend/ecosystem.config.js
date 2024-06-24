module.exports ={
    apps:[
        {
            name:'school-management',
            script:'server.js',
            instances:1,
            watch:true,
            autorestart:true,
            max_memory_restart:'1G',
        }
    ]
}