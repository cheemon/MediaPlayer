/*
 * @author  Cheemon
 * email    cheemonnet@gmail.com
 * http://github.com/cheemon/MediaPlayer
 * Media Player*/
(function(){
    function proxy(selector,type,fn){
        selector.addEventListener(type,fn);
    }

    var _,Media;

    /*
     * id: dom id
     */
    function MediaPlayer(id,options){
        _=this;
        var defaults={
            defaultPlaybackRate:0,//默认的回放速度
            autoPlay:false,//是否自动播放,
            loop:false,//是否循环播放
            error:null //发生错误回调函数
        };
        _.settings=  defaults;
        for(var o in options){
            _.settings[o]=options[o];
        }


        _.bufferTimer=null;//buffer timer
        _.id=id;
        _.processWraper           = document.createElement('div');
        _.playBtn                 = document.createElement('i');
        _.process                 = document.createElement('p');
        _.bufferprocess           = document.createElement('p');
        _.errorTip                = document.createElement('span');
        _.timeTip                 = document.createElement('span');
        _.processWraper.className = 'process-control';
        _.playBtn.className       = 'icon-play';
        _.process.className       = 'process';
        _.bufferprocess.className = 'bufferprocess';
        _.errorTip.className      = 'error';
        _.timeTip.className       = 'time';

        _.timeTip.innerHTML='00:00/00:00';

        Media = document.createElement('audio');
        Media.setAttribute("src",document.getElementById(_.id).getAttribute('data-src'));
        if(!_.settings.autoPlay){
            Media.setAttribute("preload","metadata");//预先获得音频的元数据信息(比如文件的大小，时长等),默认auto
        }else{
            Media.setAttribute("autoplay",'true');
            _.playBtn.className='icon-pause';
        }
        _.settings.loop&& Media.setAttribute("loop",'true');//设置循环播放
        _.processWraper.appendChild(Media);
        _.processWraper.appendChild(_.process);//附加播放进度元素
        _.processWraper.appendChild(_.bufferprocess);//附加缓冲进度元素
        _.processWraper.appendChild(_.errorTip);
        _.processWraper.appendChild(_.timeTip);
        document.getElementById(_.id).appendChild(_.playBtn);
        document.getElementById(_.id).appendChild(_.processWraper);

        /*Media Event*/
        proxy(Media,'error', _.error);
        proxy(Media,'timeupdate', _.updateInterface);
        proxy(Media,'canplay', _.setBuffer);
        proxy(Media,'ended', _.resetPlay);
        proxy(Media,'loadedmetadata', _.loadedMetaData);
        //control progress
        proxy(_.processWraper,'touchstart', _.forwardOrBack);
        /*播放暂停事件*/
        proxy(_.playBtn,'touchend', function(e){
            e.preventDefault();
            if(_.playBtn.className.indexOf('icon-pause')>-1){
                _.pause();
            }else{
                _.play();
            }
        });

        return _;
    };
    MediaPlayer.prototype={
        construtor:MediaPlayer,
        resetPlay:function(){
            _.bufferprocess.style.width='0px';
            _.process.style.width='0px';
            _.playBtn.className='icon-play';
            _.updateTimePlayed(0);
        },
        play:function(){

            Media.play();
            _.playBtn.className='icon-pause';
            _.process.className='process';
        },
        pause:function(){
            Media.pause();
            _.playBtn.className='icon-play';

        },
        /*更新播放时界面的的进度、已播放时间等*/
        updateInterface:function(){
            /*更新按钮状态*/

           if(_.playBtn.className=='icon-play'&&Media.played){

               this.pause();
           }
            if(!isNaN(this.duration)){
                var playedTime=Media.currentTime;
                var totalTime=Media.duration;
                var processPercent=playedTime/totalTime;
                var curProcess=processPercent* _.processWraper.offsetWidth;
                _.process.style.width=curProcess+'px';
                _.updateTimePlayed();
            }
        },
        /*调整进度*/
        forwardOrBack:function(e){
            var pageX=e.targetTouches[0].pageX;

            var processX=pageX - _.processWraper.getBoundingClientRect().left;
            var progress=parseInt((processX / _.processWraper.offsetWidth) * (Media.duration));

            Media.currentTime=isFinite(progress)?progress:0;
        },
        formatTime:function(time){
            var minute,second;

            minute=parseInt(parseInt(time)%3600/60).toString();
            if(minute.length==1){
                minute='0'+minute;
            }
            second=parseInt(parseInt(time)%60).toString();
            if(second.length==1){
                second='0'+second;
            }
            return minute+':'+second;
        },
        /*
         * set buffer
         */
        setBuffer : function(){
            _.bufferTimer = setInterval(function(){
                var buffer = Media.buffered.length;
                if(buffer > 0 && Media.buffered != undefined){
                    var bufferWidth =  (Media.buffered.end(buffer-1) / Media.duration) * _.processWraper.offsetWidth;
                    _.bufferprocess.style.width = bufferWidth + 'px';
                    if(Math.abs(Media.duration - Media.buffered.end(buffer-1)) <1){
                        _.bufferprocess.style.width = _.processWraper.offsetWidth + 'px';
                        clearInterval(_.bufferTimer);
                    }
                }
            },1000);
        },
        /*成功获取资源长度 */
        loadedMetaData:function(){
            _.updateTimePlayed();
        },
        /*更新已播放时间*/
        updateTimePlayed:function(time){
            var currentTime=(time==undefined||time==null)?Media.currentTime:time;
            _.timeTip.innerText=_.formatTime(Math.floor(currentTime))+'/' + _.formatTime(Media.duration);
        },
        error:function(){
            //1.用户终止 2.网络错误 3.解码错误 4.URL无效
            var errorStatus=["用户终止","网络错误","解码错误","URL无效"];
            _.errorTip.innerText=errorStatus[Media.error.code-1];
            if(_.error!=null){
                _.settings.error();
            }
        }

    };
    window["MediaPlayer"]=MediaPlayer;
})();