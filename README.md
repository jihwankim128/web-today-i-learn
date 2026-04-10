# Today I Learn 페이지 만들기

## DDL 실습

### 문제 1. 테이블 생성하기 (CREATE TABLE)

1. attendance 테이블은 중복된 데이터가 쌓이는 구조이다. 중복된 데이터는 어떤 컬럼인가?
   * crew_id와 nickname이 같은 값으로 중복되어 쌓이고 있다.

2. attendance 테이블에서 중복을 제거하기 위해 crew 테이블을 만들려고 한다. 어떻게 구성해 볼 수 있을까?
   * crew_id와 nickname으로 구성한다.
   * 우테코라는 상황에서 기수 별 닉네임은 고유하므로 (기수, 닉네임)을 유니크 제약을 추가한다.
     * 하지만 현재 기수 정보가 없으므로 따로 제약은 추가하지 않는다.
   
3. crew 테이블에 들어가야 할 크루들의 정보는 어떻게 추출할까? (hint: DISTINCT)
    * attendance에서 중복된 crew를 제외하고 추출할 수 있다.
   ```sql
    SELECT DISTINCT crew_id, nickname FROM attendance;
    ```

4. 최종적으로 crew 테이블 생성:

    ```sql
    CREATE TABLE crew (
        crew_id INT NOT NULL AUTO_INCREMENT,
        nickname VARCHAR(50) NOT NULL,
        PRIMARY KEY (crew_id)
    );
    ```

5. attendance 테이블에서 크루 정보를 추출해서 crew 테이블에 삽입하기:

    ```sql
    INSERT INTO crew (crew_id, nickname)
    SELECT DISTINCT crew_id, nickname 
    FROM attendance;
    ```

### 문제 2: 테이블 컬럼 삭제하기 (ALTER TABLE)

1. crew 테이블을 만들고 중복을 제거했다. attendance에서 불필요해지는 컬럼은?
   * crew 테이블에 1정규화를 적용했으므로, 식별 해야하므로 crew_id는 필요하고 nickname이 불필요해짐

2. 컬럼을 삭제하려면 어떻게 해야 하는가?
   ```sql
   ALTER TABLE attendance
   DROP COLUMN nickname;
   ```

### 문제 3: 외래키 설정하기

1. 만약에 crew 테이블에는 crew_id가 12번인 크루가 존재하지 않지만, attendance 테이블에는 여전히 crew_id가 12번인 크루가 존재한다면?
   * attendance와 crew간 데이터의 관계가 없기 때문에, 무결성을 위반하는 문제가 발생한다.
   * 관계를 표현할 수 있도록 attendance에 crew_id에 대한 외래키 설정을 한다.
   ```sql
   ALTER TABLE attendance
   ADD CONSTRAINT fk_attendance_crew
   FOREIGN KEY (crew_id) REFERENCES crew(crew_id);
   ```

### 문제 4: 유니크 키 설정
1. 우아한테크코스에서는 닉네임의 '중복'이 엄연히 금지된다. 그런데 현재 테이블에는 중복된 닉네임이 담길 수 있다. crew 테이블의 결함을 어떻게 해결할 수 있을까?
   * 유니크 키를 활용해 중복되지 않는 값임을 명시한다.
   ```sql
   ALTER TABLE crew
   ADD CONSTRAINT uq_crew_nickname UNIQUE (nickname);
   ```

## DML(CRUD) 실습

### 문제 5: 크루 닉네임 검색하기 (LIKE)

1. 3월 4일, 아침에 검프에게 어떤 크루가 상냥하게 인사했다. 그런데 검프도 구면인 것 같아서 닉네임 첫 글자가 디라는 건 떠올랐는데... 누구지?
   ```sql
   SELECT *
   FROM crew
   WHERE nickname LIKE '디%';
   ```

### 문제 6: 출석 기록 확인하기 (SELECT + WHERE)

1. 성실의 아이콘 어셔는 등굣길에 스마트폰을 떨어뜨리는 바람에 3월 6일에 등교/하교 버튼을 누르지 못했다. 담당 코치에게 빠르게 공유한 그를 구제하기 위해 검프가 출석 처리를 해 주려고 한다.
   ```sql
   SELECT *
   FROM attendance a
   JOIN crew c ON a.crew_id = c.crew_id
   WHERE c.nickname = '어셔'
     AND a.attendance_date = '2025-03-06';
   ```

### 문제 7: 누락된 출석 기록 추가 (INSERT)

1. 확인해 보니, 어셔는 그날 출석 체크를 하지 못한 것이 사실로 드러났다. 사후 처리를 위해 출석을 추가해야 하는데 어떻게 추가해야 할까?
   ```sql
   INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
   SELECT crew_id, '2025-03-06', '09:31', '18:01'
   FROM crew
   WHERE nickname = '어셔';
   ```

### 문제 8: 잘못된 출석 기록 수정 (UPDATE)
1. 주니는 3월 12일 10시 정각에 캠퍼스에 도착했지만, 등교 버튼을 누르는 것을 깜빡하고 데일리 미팅에 참여했다. 뒤늦게야 알게 됐는데 시각은 10시 5분... 지각 처리가 되는 시점이었다.
   ```sql
   UPDATE attendance a
   JOIN crew c ON a.crew_id = c.crew_id
   SET a.start_time = '10:00'
   WHERE c.nickname = '주니'
     AND a.attendance_date = '2025-03-12';
   ```

### 문제 9: 허위 출석 기록 삭제 (DELETE)
1. 시력은 좋지 않지만, 평소 눈썰미가 좋은 검프는 아론이 3월 12일에 캠퍼스에 도착하지 않은 점을 깨달았다. 그런데 무슨 이유에서인지 그날 출석 처리가 되어 있는 것을 우연히 발견했다.
   ```sql
   DELETE a
   FROM attendance a
   JOIN crew c ON a.crew_id = c.crew_id
   WHERE c.nickname = '아론'
   AND a.attendance_date = '2025-03-12';
   ```

### 문제 10: 출석 정보 조회하기 (JOIN)
1. 검프는 SQL이 익숙지 않아 crew 테이블에서 먼저 닉네임을 검색하고 해당 아이디 값을 찾아 직접 WHERE문에서 crew_id 항목의 값을 수동으로 입력해서 출석 기록을 조회했다. 그런데 crew 테이블에서 crew_id를 기준으로 nickname 필드 값을 가져와서 함께 조회할 수도 있지 않을까?
   ```sql
   SELECT c.nickname, a.attendance_date, a.start_time, a.end_time
   FROM attendance a
   JOIN crew c ON a.crew_id = c.crew_id
   ORDER BY c.crew_id, a.attendance_date;
   ```

### 문제 11: nickname으로 쿼리 처리하기 (서브 쿼리)
1. 검프는 SQL이 익숙지 않아 crew 테이블에서 먼저 닉네임을 검색하고 해당 아이디 값을 찾아 직접 WHERE문에서 crew_id 항목의 값을 수동으로 입력했다. 그런데 nickname을 입력하면 이를 기준으로 쿼리문을 처리할 수도 있지 않을까?
   ```sql
   SELECT *
   FROM attendance
   WHERE crew_id = (SELECT crew_id FROM crew WHERE nickname = '검프')
   ORDER BY attendance_date;
   ```

### 문제 12: 가장 늦게 하교한 크루 찾기
1. 3월 6일, 검프는 우연히 아침에 일찍 눈을 떴다. 상쾌하게 일찍 출근하기로 마음을 먹고 캠퍼스로 향했다. 검프가 가장 먼저 도착했다. 하지만, 경비 처리가 되어 있지 않은 걸 확인했다. 전날(3월 5일) 가장 늦게 하교한 크루를 찾아 DM을 보내려고 하는데 크루의 닉네임과 하교 시각은 어떻게 찾을 수 있을까?
   ```sql
   SELECT c.nickname, a.end_time
   FROM attendance a
   JOIN crew c ON a.crew_id = c.crew_id
   WHERE a.attendance_date = '2025-03-05'
   ORDER BY a.end_time DESC
   LIMIT 1;
   ```

## 집계 함수 실습

### 문제 13: 크루별로 '기록된' 날짜 수 조회
```sql
SELECT c.nickname, COUNT(*) AS 기록_날짜_수
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
GROUP BY a.crew_id
ORDER BY 기록_날짜_수 DESC;
```

### 문제 14: 크루별로 등교 기록이 있는(start_time IS NOT NULL) 날짜 수 조회
```sql
SELECT c.nickname, COUNT(a.start_time) AS 등교_기록_수
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
WHERE a.start_time IS NOT NULL
GROUP BY a.crew_id
ORDER BY 등교_기록_수 DESC;
```

### 문제 15: 날짜별로 등교한 크루 수 조회
```sql
SELECT attendance_date, COUNT(*) AS 크루_수
FROM attendance
WHERE start_time IS NOT NULL
GROUP BY attendance_date
ORDER BY 크루_수;
```

### 문제 16: 크루별 가장 빠른 등교 시각(MIN)과 가장 늦은 등교 시각(MAX)
```sql
SELECT c.nickname AS 크루,
       MIN(a.start_time) AS 가장_빠른_등교_시간,
       MAX(a.start_time) AS 가장_늦은_등교_시간
FROM attendance a
JOIN crew c ON a.crew_id = c.crew_id
GROUP BY a.crew_id
ORDER BY a.crew_id;
```