// ── search_data.js ──────────────────────────────────────────────
// 데이터 비트박스 — 전체 단원 검색 DB
// 오프라인 완전 동작 (외부 서버 불필요)
// 수정 방법: keyword(검색어), aliases(동의어), desc(설명) 수정 가능

const SEARCH_DB = [

    // ════════════════════════════════════════════════════
    // STEP 1 · 디지털 데이터의 가치
    // ════════════════════════════════════════════════════
    {
        keyword: '데이터',
        aliases: ['data', 'DATA'],
        step: 1, part: 'PART 01',
        title: '디지털 데이터의 가치',
        url: '01_value.html',
        anchor: '#step1-intro',
        desc: '문자·숫자·이미지·소리·동영상·센서 등 생활 속 모든 정보'
    },
    {
        keyword: '아날로그',
        aliases: ['analog', 'Analog'],
        step: 1, part: 'PART 01',
        title: '디지털 데이터의 가치',
        url: '01_value.html',
        anchor: '#step2-visual',
        desc: '소리나 빛 등 연속적으로 변화하는 형태 그대로 기록하는 방식'
    },
    {
        keyword: '디지털',
        aliases: ['digital', 'Digital'],
        step: 1, part: 'PART 01',
        title: '디지털 데이터의 가치',
        url: '01_value.html',
        anchor: '#step2-visual',
        desc: '현실 세계의 연속적인 정보를 0과 1(비트)로 이루어진 비연속적인 신호로 변환하여 나타내는 방식'
    },
    {
        keyword: '아날로그 vs 디지털',
        aliases: ['아날로그 디지털 비교', '아날로그와 디지털'],
        step: 1, part: 'PART 01',
        title: '디지털 데이터의 가치',
        url: '01_value.html',
        anchor: '#step3-compare',
        desc: '복제·보존·전송 품질 차이 비교'
    },
    {
        keyword: '센서 데이터',
        aliases: ['센서'],
        step: 1, part: 'PART 01',
        title: '디지털 데이터의 가치',
        url: '01_value.html',
        anchor: '#step1-intro',
        desc: '스마트워치·온도계 등 센서가 수집하는 디지털 데이터'
    },
    {
        keyword: 'AI',
        aliases: ['인공지능', '머신러닝'],
        step: 1, part: 'PART 01',
        title: '디지털 데이터의 가치',
        url: '01_value.html',
        anchor: '#step2-visual',
        desc: '인간의 인식·판단 등 지능적 기능을 수행하는 소프트웨어. 이미지·소리·문자 등 디지털 데이터를 0과 1로 학습해 암 진단·자율주행·기후예측 등에 활용'
    },
    {
        keyword: '공공 데이터',
        aliases: [],
        step: 1, part: 'PART 01',
        title: '디지털 데이터의 가치',
        url: '01_value.html',
        anchor: '#step2-visual',
        desc: '사회 발전을 위해 공개·활용되는 국가 데이터'
    },


    // ════════════════════════════════════════════════════
    // STEP 2 · 비트(Bit)란?
    // ════════════════════════════════════════════════════
    {
        keyword: '비트',
        aliases: ['Bit', 'bit', 'BIT'],
        step: 2, part: 'PART 01',
        title: '비트(Bit)란?',
        url: '02_bit.html',
        anchor: '#step1-visual',
        desc: '0 또는 1만 표현하는 디지털 데이터의 가장 작은 단위. Binary Digit의 줄임말'
    },
    {
        keyword: '이진수',
        aliases: ['binary', 'Binary', '2진수', '2진법'],
        step: 2, part: 'PART 01',
        title: '비트(Bit)란?',
        url: '02_bit.html',
        anchor: '#step2-concept',
        desc: '0과 1만 사용하는 수 체계. 컴퓨터가 데이터를 표현하는 방식'
    },
    {
        keyword: '바이트',
        aliases: ['Byte', 'byte'],
        step: 2, part: 'PART 01',
        title: '비트(Bit)란?',
        url: '02_bit.html',
        anchor: '#step3-byte',
        desc: '8비트 = 1바이트. 실질적인 데이터 저장의 기본 단위'
    },
    {
        keyword: '킬로바이트',
        aliases: ['KB', 'kilobyte'],
        step: 2, part: 'PART 01',
        title: '비트(Bit)란?',
        url: '02_bit.html',
        anchor: '#step3-byte',
        desc: '1KB = 1,024 Byte'
    },
    {
        keyword: '메가바이트',
        aliases: ['MB', 'megabyte'],
        step: 2, part: 'PART 01',
        title: '비트(Bit)란?',
        url: '02_bit.html',
        anchor: '#step3-byte',
        desc: '1MB = 1,024 KB'
    },
    {
        keyword: '기가바이트',
        aliases: ['GB', 'gigabyte'],
        step: 2, part: 'PART 01',
        title: '비트(Bit)란?',
        url: '02_bit.html',
        anchor: '#step3-byte',
        desc: '1GB = 1,024 MB'
    },
    {
        keyword: '테라바이트',
        aliases: ['TB', 'terabyte'],
        step: 2, part: 'PART 01',
        title: '비트(Bit)란?',
        url: '02_bit.html',
        anchor: '#step3-byte',
        desc: '1TB = 1,024 GB'
    },
    {
        keyword: '용량 단위',
        aliases: ['저장 단위', '데이터 단위'],
        step: 2, part: 'PART 01',
        title: '비트(Bit)란?',
        url: '02_bit.html',
        anchor: '#step3-byte',
        desc: 'bit → Byte → KB → MB → GB → TB 단위 체계'
    },


    // ════════════════════════════════════════════════════
    // STEP 3 · 숫자의 디지털 표현
    // ════════════════════════════════════════════════════
    {
        keyword: '십진수',
        aliases: ['decimal', '10진수', '10진법'],
        step: 3, part: 'PART 02',
        title: '숫자의 디지털 표현',
        url: '03_number.html',
        anchor: '#step1-visual',
        desc: '0~9까지 10개의 숫자를 사용하는 우리가 일상에서 쓰는 수 체계'
    },
    {
        keyword: '이진수 변환 방법',
        aliases: ['이진수 계산', '십진수 이진수', '2진수 변환 방법'],
        step: 3, part: 'PART 02',
        title: '숫자의 디지털 표현',
        url: '03_number.html',
        anchor: '#step1-visual',
        desc: '십진수→이진수: 2로 계속 나눈 나머지를 거꾸로 읽기. \n 이진수→십진수: 켜진 자리의 값(1, 2, 4, 8, 16...)을 모두 합산'
    },
    {
        keyword: '이진수 자릿값',
        aliases: ['자릿값', '자리값', '2의 거듭제곱'],
        step: 3, part: 'PART 02',
        title: '숫자의 디지털 표현',
        url: '03_number.html',
        anchor: '#step1-visual',
        desc: '이진수 각 자리는 오른쪽→왼쪽으로 2배씩 커짐 (2⁰=1, 2¹=2, 2²=4, 2³=8...)'
    },



    // ════════════════════════════════════════════════════
    // STEP 4 · 문자의 디지털 표현
    // ════════════════════════════════════════════════════
    {
        keyword: '아스키코드',
        aliases: ['ASCII', 'ascii', '아스키', '디지털 문자'],
        step: 4, part: 'PART 02',
        title: '문자의 디지털 표현',
        url: '04_text.html',
        anchor: '#step3-ascii',
        desc: '영문자·숫자·특수문자를 숫자로 표현한 미국 표준 코드. 7비트 표준 128개, 8비트 확장 256개 문자 표현 가능'
    },
    {
        keyword: '유니코드',
        aliases: ['Unicode', 'unicode', '디지털 문자'],
        step: 4, part: 'PART 02',
        title: '문자의 디지털 표현',
        url: '04_text.html',
        anchor: '#step4-unicode',
        desc: '전 세계 모든 언어·이모티콘에 고유 번호를 부여한 국제 표준 (U+ 형식)'
    },
    {
        keyword: 'UTF-8',
        aliases: ['utf8', 'utf-8', '유니코드 인코딩'],
        step: 4, part: 'PART 02',
        title: '문자의 디지털 표현',
        url: '04_text.html',
        anchor: '#step5-utf8',
        desc: '영어 1바이트, 한글 3바이트, 이모티콘 4바이트로 저장하는 인코딩 방식'
    },
    {
        keyword: '완성형 한글코드',
        aliases: ['완성형', '완성형 코드'],
        step: 4, part: 'PART 02',
        title: '문자의 디지털 표현',
        url: '04_text.html',
        anchor: '#step4-unicode',
        desc: '가·각·간처럼 완성된 글자 하나하나에 고유 번호를 붙이는 방식'
    },
    {
        keyword: '조합형 한글코드',
        aliases: ['조합형', '조합형 코드'],
        step: 4, part: 'PART 02',
        title: '문자의 디지털 표현',
        url: '04_text.html',
        anchor: '#step4-unicode',
        desc: '초성·중성·종성 각각에 번호를 부여해 조립하는 방식 (레고 블록)'
    },
    {
        keyword: '문자 인코딩',
        aliases: ['인코딩', 'encoding'],
        step: 4, part: 'PART 02',
        title: '문자의 디지털 표현',
        url: '04_text.html',
        anchor: '#step5-utf8',
        desc: '문자를 컴퓨터가 저장할 수 있는 이진수로 변환하는 과정'
    },


    // ════════════════════════════════════════════════════
    // STEP 5 · 이미지의 디지털 표현
    // ════════════════════════════════════════════════════
    {
        keyword: '픽셀',
        aliases: ['pixel', '디지털 이미지', '화소', '그림'],
        step: 5, part: 'PART 03',
        title: '이미지의 디지털 표현',
        url: '05_image.html',
        anchor: '#step1-visual',
        desc: '디지털 화면을 구성하는 가장 작은 사각형 점 단위 (화소)'
    },
    {
        keyword: '해상도',
        aliases: ['resolution', '픽셀 수', '1920x1080'],
        step: 5, part: 'PART 03',
        title: '이미지의 디지털 표현',
        url: '05_image.html',
        anchor: '#step3-advanced',
        desc: '이미지가 몇 개의 픽셀로 이루어졌는지 나타내는 정밀도 (예: 1920×1080)'
    },
    {
        keyword: 'RGB',
        aliases: ['rgb', '빛의 삼원색', '색상 코드'],
        step: 5, part: 'PART 03',
        title: '이미지의 디지털 표현',
        url: '05_image.html',
        anchor: '#step1-visual',
        desc: '빨강(R)·초록(G)·파랑(B) 각 8비트 조합으로 색을 표현. 1픽셀 = 24비트'
    },
    {
        keyword: '비트맵',
        aliases: ['bitmap', 'BMP', 'JPG', 'PNG', '래스터'],
        step: 5, part: 'PART 03',
        title: '이미지의 디지털 표현',
        url: '05_image.html',
        anchor: '#step2-concept',
        desc: '이미지를 픽셀 단위로 구별하여 표현하는 방식. 확대 시 계단 현상 발생. 대표 형식: BMP, JPG, PNG'
    },
    {
        keyword: '벡터',
        aliases: ['vector', 'SVG', '벡터 이미지'],
        step: 5, part: 'PART 03',
        title: '이미지의 디지털 표현',
        url: '05_image.html',
        anchor: '#step5-vector',
        desc: '점과 점 사이의 위치를 계산하여 선·색상·모양 등의 데이터로 이미지를 표현하는 방식. 무한 확대해도 깨지지 않음. 대표 형식: SVG, AI'
    },
    {
        keyword: '계단 현상',
        aliases: ['픽셀 깨짐', '이미지 깨짐'],
        step: 5, part: 'PART 03',
        title: '이미지의 디지털 표현',
        url: '05_image.html',
        anchor: '#step3-advanced',
        desc: '비트맵 이미지를 무리하게 확대할 때 모서리가 계단처럼 보이는 현상'
    },
    {
        keyword: '비트 심도',
        aliases: ['비트 깊이', 'bit depth', '색상 팔레트'],
        step: 5, part: 'PART 03',
        title: '이미지의 디지털 표현',
        url: '05_image.html',
        anchor: '#step4-bitmap',
        desc: '색상을 몇 비트로 표현하는지를 나타내는 단위. 비트 수가 클수록 더 많은 색 표현 가능'
    },
    {
        keyword: '24비트 색상',
        aliases: ['트루컬러', 'True Color', '1600만 색'],
        step: 5, part: 'PART 03',
        title: '이미지의 디지털 표현',
        url: '05_image.html',
        anchor: '#step1-visual',
        desc: 'R·G·B 각 8비트 = 총 24비트. 약 1600만 가지 색 표현 가능'
    },

    // ════════════════════════════════════════════════════
    // STEP 6 · 소리의 디지털 표현
    // ════════════════════════════════════════════════════
    {
        keyword: '표본화',
        aliases: ['샘플링', 'sampling', '표본추출'],
        step: 6, part: 'PART 03',
        title: '소리의 디지털 표현',
        url: '06_sound.html',
        anchor: '#step1-visual',
        desc: '아날로그 파형을 일정 시간 간격으로 잘라 값을 추출하는 과정'
    },
    {
        keyword: '양자화',
        aliases: ['quantization'],
        step: 6, part: 'PART 03',
        title: '소리의 디지털 표현',
        url: '06_sound.html',
        anchor: '#step2-concept',
        desc: '표본화로 추출한 값을 가장 가까운 정수로 반올림하여 수치화하는 단계'
    },
    {
        keyword: '부호화',
        aliases: ['coding', '이진수 변환'],
        step: 6, part: 'PART 03',
        title: '소리의 디지털 표현',
        url: '06_sound.html',
        anchor: '#step2-concept',
        desc: '양자화로 얻은 정수 값을 0과 1의 이진수로 변환하는 단계'
    },
    {
        keyword: 'PCM',
        aliases: ['pcm', '디지털 변환 과정'],
        step: 6, part: 'PART 03',
        title: '소리의 디지털 표현',
        url: '06_sound.html',
        anchor: '#step2-concept',
        desc: '표본화 → 양자화 → 부호화 3단계로 소리를 디지털화하는 방식'
    },
    {
        keyword: '샘플링 레이트',
        aliases: ['표본화율', 'Hz', '헤르츠', '샘플링 주파수'],
        step: 6, part: 'PART 03',
        title: '소리의 디지털 표현',
        url: '06_sound.html',
        anchor: '#step3-advanced',
        desc: '소리를 일정 간격으로 나누는 횟수(1초 기준). 수치가 높을수록 원음에 가깝고 음질이 좋음'
    },
    {
        keyword: '파형',
        aliases: ['음파', '소리 파형', 'waveform'],
        step: 6, part: 'PART 03',
        title: '소리의 디지털 표현',
        url: '06_sound.html',
        anchor: '#step1-visual',
        desc: '소리의 진동이 시간에 따라 끊김 없이 연속적으로 변화하는 물결 모양의 신호'
    },
    {
        keyword: '소리 용량',
        aliases: ['오디오 용량', '음성 파일 크기'],
        step: 6, part: 'PART 03',
        title: '소리의 디지털 표현',
        url: '06_sound.html',
        anchor: '#step3-advanced',
        desc: '샘플 수 × 비트 심도로 결정. 값이 높을수록 음질 좋고 용량 큼'
    },

    // ════════════════════════════════════════════════════
    // STEP 7 · 동영상의 디지털 표현
    // ════════════════════════════════════════════════════
    {
        keyword: '프레임',
        aliases: ['frame', 'Frame', '정지 이미지'],
        step: 7, part: 'PART 03',
        title: '동영상의 디지털 표현',
        url: '07_video.html',
        anchor: '#step1-visual',
        desc: '동영상을 구성하는 낱장의 정지 이미지. 수많은 프레임이 모여 영상이 됨'
    },
    {
        keyword: 'fps',
        aliases: ['FPS', '프레임률', '프레임 레이트', '초당 프레임'],
        step: 7, part: 'PART 03',
        title: '동영상의 디지털 표현',
        url: '07_video.html',
        anchor: '#step2-concept',
        desc: '1초에 보여주는 프레임 수. 영화 24fps, 게임 60fps 이상'
    },
    {
        keyword: '잔상 효과',
        aliases: ['잔상', 'Persistence of Vision'],
        step: 7, part: 'PART 03',
        title: '동영상의 디지털 표현',
        url: '07_video.html',
        anchor: '#step2-concept',
        desc: '실제 보았던 시간보다 오래 눈에 남아있는 현상. 정지된 이미지를 빠르게 연속으로 보여주면 뇌가 움직임으로 착각하는 동영상의 원리'
    },
    {
        keyword: '동영상 압축',
        aliases: ['코덱', 'Codec', '압축', 'compression'],
        step: 7, part: 'PART 03',
        title: '동영상의 디지털 표현',
        url: '07_video.html',
        anchor: '#step2-concept',
        desc: '앞뒤 프레임의 비슷한 부분을 묶어 용량을 줄이는 코덱(Codec) 기술'
    },
    {
        keyword: '동영상 용량',
        aliases: ['영상 파일 크기', '동영상 데이터'],
        step: 7, part: 'PART 03',
        title: '동영상의 디지털 표현',
        url: '07_video.html',
        anchor: '#step3-advanced',
        desc: '프레임 1장 용량 × fps × 재생 시간(초). 압축 전 용량은 매우 큼'
    },
    {
        keyword: '스트리밍',
        aliases: ['streaming', 'Streaming'],
        step: 7, part: 'PART 03',
        title: '동영상의 디지털 표현',
        url: '07_video.html',
        anchor: '#step4-quiz',
        desc: '동영상을 전부 다운로드하지 않고 실시간으로 재생하는 방식'
    },

];

// 검색 함수 (외부에서 사용)
function searchKeyword(query) {
    if (!query || query.trim().length < 1) return [];
    const q = query.trim().toLowerCase();
    return SEARCH_DB.filter(item => {
        const inKeyword = item.keyword.toLowerCase().includes(q);
        const inAliases = item.aliases.some(a => a.toLowerCase().includes(q));
        const inDesc    = item.desc.toLowerCase().includes(q);
        return inKeyword || inAliases || inDesc;
    });
}