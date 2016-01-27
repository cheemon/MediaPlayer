/*
 * @author  Cheemon
 * email    cheemonnet@gmail.com
 * Media Player*/
(function(){
    function proxy(selector,type,fn){
        selector.addEventListener(type,fn);
    }

    var _,Media;

    /*
     * id: dom id
     */
    function MediaPlayer(id){
        _=this;
        _.bufferTimer=null;//buffer timer
        _.id=id;
        _.processWraper           = document.createElement('div');
        _.playBtn                 = document.createElement('i');
        _.process                 = document.createElement('p');
        _.bufferprocess           = document.createElement('p');
        _.errorTip                = document.createElement('span');
        _.processWraper.className = 'process-control';
        _.playBtn.className       = 'icon-play';
        _.process.className       ='process';
        _.bufferprocess.className       ='bufferprocess';
        _.errorTip.className='error';
        Media = document.createElement('audio');

        Media.setAttribute("src",document.getElementById(_.id).getAttribute('data-src'));
        Media.setAttribute("preload","none");//是否在页面加载后载入音频

        _.processWraper.appendChild(Media);
        _.processWraper.appendChild(_.process);//附加播放进度元素
        _.processWraper.appendChild(_.bufferprocess);//附加缓冲进度元素
        _.processWraper.appendChild(_.errorTip);
        document.getElementById(_.id).appendChild(_.playBtn);
        document.getElementById(_.id).appendChild(_.processWraper);

        /*Media Event*/
        proxy(Media,'error', _.error);
        proxy(Media,'timeupdate', _.updateInterface);
        proxy(Media,'canplay', _.setBuffer);
        proxy(Media,'ended', _.resetPlay);

        //control progress
        proxy(_.processWraper,'touchstart', _.progress);


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
        },
        play:function(){
            MediaPlayer.currentTime = 20;
            Media.play();
            _.playBtn.className='icon-pause';
            _.process.className='process';
        },
        pause:function(){
            Media.pause();
            _.playBtn.className='icon-play';

        },
        updateInterface:function(){

            if(!isNaN(this.duration)){
                var playedTime=Media.currentTime;
                var totalTime=Media.duration;
                var processPercent=playedTime/totalTime;
                var curProcess=processPercent* _.processWraper.offsetWidth;
                _.process.style.width=curProcess+'px';
            }
        },
        progress:function(e){
            var pageX=e.targetTouches[0].pageX;

            var processX=pageX - _.processWraper.getBoundingClientRect().left;
            var progress=parseInt((processX / _.processWraper.offsetWidth) * (Media.duration));

            Media.currentTime=isFinite(progress)?progress:0;
            Media.play();
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
        error:function(){
            //1.用户终止 2.网络错误 3.解码错误 4.URL无效
            var errorStatus=["用户终止","网络错误","解码错误","URL无效"];
            _.errorTip.innerText=errorStatus[Media.error.code-1];
        }

    };


    window["MediaPlayer"]=MediaPlayer;
})();