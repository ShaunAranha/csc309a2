--- load with
--- sqlite3 database.db < schema.sql



CREATE TABLE appuser (
	id VARCHAR(20),
	password VARCHAR(20),
	name VARCHAR(50),
	gender VARHCAR(20) CHECK (gender IN ('Male', 'Female', 'Other')) ,
	email VARCHAR(50),
	PRIMARY KEY(id)
);
CREATE TABLE scores (
	id VARCHAR(20),
	score INTEGER
);


