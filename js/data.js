/* ═══════════════════════════════════════════════════════════════
   DATA.JS — All static game content
   ═══════════════════════════════════════════════════════════════ */

const DATA = (() => {

  // ── Names ──────────────────────────────────────────────────────
  const MALE_NAMES = [
    'James','Oliver','Noah','Liam','Ethan','Lucas','Mason','Logan','Aiden','Elijah',
    'Jackson','Sebastian','Henry','Owen','Ryan','Nathan','Caleb','Isaac','Adam','Theo',
    'Carlos','Marco','Kenji','Andre','Dmitri','Finn','Ravi','Idris','Mateo','Soren',
    'Viktor','Ezra','Miles','Jasper','Felix','Atticus','Ronan','Hugo','Caspian','Zane',
    'Diego','Santiago','Alejandro','Pablo','Miguel','Rafael','Javier','Luis','Eduardo','Andres',
    'Elias','Julian','Adrian','Dominic','Leonardo','Tobias','Rhys','Kieran','Matteo','Nico',
    'Cyrus','Damon','Emilio','Fabian','Gio','Hamish','Isidore','Jett','Kian','Leandro',
    'Maxwell','Naveen','Otto','Pierce','Quentin','Roman','Stellan','Tariq','Ulric','Vance',
    'Warren','Xander','Yusuf','Zephyr','Amos','Bram','Cillian','Dag','Edmund','Florian',
    'Gideon','Hector','Ivan','Joaquin','Kaspar','Lorenz','Milo','Nils','Osiris','Phelan'
  ];
  const FEMALE_NAMES = [
    'Emma','Olivia','Ava','Sophia','Mia','Isabella','Charlotte','Amelia','Harper','Evelyn',
    'Luna','Nora','Lily','Eleanor','Violet','Zoe','Chloe','Penelope','Layla','Aurora',
    'Sofia','Aria','Isla','Scarlett','Maya','Stella','Elena','Naomi','Cora','Quinn',
    'Freya','Niamh','Ingrid','Yuki','Priya','Aaliyah','Sienna','Camille','Adaeze','Lena',
    'Carmen','Valentina','Lucia','Catalina','Gabriela','Isabel','Patricia','Rosa','Mariana','Fernanda',
    'Astrid','Beatrix','Celeste','Delphine','Esme','Fiona','Genevieve','Hana','Iris','Juniper',
    'Katarina','Lila','Marisol','Nadia','Odette','Petra','Rosaline','Simone','Thea','Uma',
    'Vesna','Winona','Xanthe','Yara','Zahra','Aoife','Brigid','Calista','Dara','Elowen',
    'Fleur','Giselle','Heloise','Imara','Jaya','Kassia','Liora','Maren','Neve','Orla',
    'Paloma','Remi','Saoirse','Talia','Ursula','Viveka','Wren','Xiomara','Yumi','Zula'
  ];
  const LAST_NAMES = [
    'Smith','Johnson','Williams','Brown','Davis','Miller','Wilson','Moore','Taylor','Anderson',
    'Jackson','White','Harris','Martin','Thompson','Robinson','Clark','Lewis','Lee','Walker',
    'Hall','Allen','Young','King','Wright','Scott','Baker','Adams','Nelson','Campbell',
    'Mitchell','Roberts','Carter','Evans','Turner','Hill','Cooper','Richardson','Cox','Ward',
    'Nguyen','Patel','Cohen','Murphy','Rivera','Chen','Morgan','Reed','Bailey','Brooks',
    'Lopez','Garcia','Martinez','Hernandez','Gonzalez','Rodriguez','Perez','Sanchez','Ramirez','Torres',
    'Fernandez','Diaz','Morales','Cruz','Reyes','Ramos','Ortega','Jimenez','Vargas','Gutierrez',
    'Collins','Stewart','Morris','Rogers','Cook','Simmons','Bell','Price','Hayes','Griffin',
    'Okafor','Adeyemi','Kimura','Tanaka','Petrov','Vogel','Larsson','Dubois','Rossi','Nkosi',
    'Osei','Alves','Ferreira','Ivanova','Andersen','Kowalski','Hajek','Popov','Suarez','Reyes'
  ];

  // ── Country-specific name pools ─────────────────────────────────
  const COUNTRY_NAMES = {
    'United States': {
      male:   ['James','Noah','Liam','Ethan','Jackson','Mason','Logan','Aiden','Carter','Sebastian','Hunter','Landon','Wyatt','Cooper','Lincoln','Grayson','Beau','Beckett','Nolan','Brooks','Blake','Cole','Grady','Holden','Jace','Knox','Lane','Maddox','Reid','Tate'],
      female: ['Emma','Olivia','Ava','Sophia','Mia','Isabella','Charlotte','Amelia','Harper','Evelyn','Abigail','Emily','Elizabeth','Sofia','Avery','Ella','Scarlett','Grace','Chloe','Zoey','Aubrey','Riley','Addison','Savannah','Brooklyn','Paisley','Kennedy','Stella','Violet','Aurora'],
      last:   ['Smith','Johnson','Williams','Brown','Davis','Miller','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Robinson','Clark','Lewis','Walker','Hall','Allen','Young','King','Wright','Scott','Baker','Adams','Nelson','Campbell']
    },
    'United Kingdom': {
      male:   ['Oliver','Harry','George','Jack','Alfie','Oscar','Charlie','Thomas','William','Archie','Theo','Edward','Arthur','Noah','Freddie','Reuben','Rupert','Hugo','Barnaby','Jasper','Kit','Monty','Piers','Quentin','Toby','Cecil','Edmund','Gilbert','Nigel','Alastair'],
      female: ['Olivia','Amelia','Isla','Ava','Mia','Freya','Lily','Emily','Sophia','Ella','Poppy','Evie','Isabella','Jessica','Grace','Sophie','Scarlett','Imogen','Ellie','Alice','Beatrice','Clarissa','Cordelia','Eugenie','Felicity','Harriet','Lavinia','Margot','Rosalind','Venetia'],
      last:   ['Smith','Jones','Williams','Taylor','Brown','Davies','Evans','Wilson','Thomas','Roberts','Johnson','Walker','Wright','Thompson','White','Hughes','Edwards','Green','Hall','Wood','Clarke','Harrison','Lewis','Turner','Martin','Cooper','Ward','Morris','Barker','Shaw']
    },
    'Canada': {
      male:   ['Liam','Noah','Oliver','William','Benjamin','Elijah','James','Lucas','Mason','Ethan','Logan','Alexander','Aiden','Jackson','Sebastian','Jacob','Carter','Gabriel','Owen','Connor','Declan','Finn','Griffin','Hudson','Keegan','Lennox','Malcolm','Niall','Reid','Rowan'],
      female: ['Emma','Olivia','Ava','Charlotte','Sophia','Isabella','Amelia','Abigail','Emily','Mia','Lily','Ella','Chloe','Madison','Addison','Riley','Zoey','Hannah','Natalie','Claire','Audrey','Brooklyn','Camille','Dahlia','Evangeline','Fiona','Genevieve','Isla','Jade','Keira'],
      last:   ['Smith','Brown','Tremblay','Martin','Roy','Wilson','Macdonald','Gagnon','Johnson','Taylor','Campbell','Anderson','Leblanc','Williams','Bouchard','Jones','Murray','Lavoie','Fortin','Côté','Pelletier','Gauthier','Morin','Simard','Lapointe','Beaulieu','Ouellet','Turgeon','Bélanger','Lemay']
    },
    'Australia': {
      male:   ['Oliver','Jack','Noah','William','Lucas','Thomas','James','Liam','Henry','Ethan','Archer','Bailey','Flynn','Heath','Jensen','Koby','Lachlan','Mitch','Nash','Reef','Riley','Seb','Taj','Zach','Angus','Brody','Callum','Declan','Hamish','Kai'],
      female: ['Charlotte','Olivia','Ava','Amelia','Mia','Isla','Grace','Sophie','Zoe','Chloe','Billie','Delta','Eden','Frankie','Harper','Indie','Jade','Keely','Lena','Matilda','Nadia','Pippa','Quinn','Ruby','Sadie','Tara','Uma','Violet','Willow','Zara'],
      last:   ['Smith','Jones','Williams','Brown','Wilson','Taylor','Johnson','White','Martin','Anderson','Thompson','Davis','Clark','Lewis','Lee','Walker','Hall','Allen','Young','Mitchell','Robinson','Harris','Turner','Moore','Evans','Cooper','Edwards','Roberts','Hill','Cook']
    },
    'Germany': {
      male:   ['Lukas','Leon','Paul','Jonas','Noah','Felix','Maximilian','Finn','Elias','Luis','Ben','Jan','Tobias','Simon','David','Alexander','Niklas','Moritz','Julian','Patrick','Benedikt','Christian','Daniel','Erik','Friedrich','Gregor','Hans','Johann','Karl','Lorenz'],
      female: ['Emma','Hannah','Mia','Sofia','Lena','Leonie','Anna','Lea','Marie','Laura','Lisa','Johanna','Sarah','Katharina','Nina','Julia','Sophia','Charlotte','Franziska','Elena','Birgit','Clara','Dorothee','Elke','Friederike','Greta','Hanna','Ines','Jana','Klara'],
      last:   ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Hoffmann','Schäfer','Koch','Bauer','Richter','Klein','Wolf','Schröder','Neumann','Schwarz','Zimmermann','Braun','Hartmann','Lange','Werner','Krause','Böhm','Schulze','Maier','Frank','Lehmann','Haas']
    },
    'France': {
      male:   ['Hugo','Louis','Lucas','Léo','Mathis','Nathan','Tom','Théo','Enzo','Maxime','Arthur','Baptiste','Clément','Damien','Edouard','François','Gaston','Henri','Julien','Kevin','Laurent','Mathieu','Nicolas','Olivier','Pascal','Quentin','Raphaël','Sébastien','Tristan','Ugo'],
      female: ['Emma','Léa','Jade','Louise','Manon','Inès','Camille','Zoé','Chloé','Sarah','Léonie','Alice','Anaïs','Béatrice','Céline','Delphine','Elodie','Fleur','Gaëlle','Hélène','Isabelle','Juliette','Karine','Laure','Margot','Nathalie','Océane','Pauline','Roxane','Solène'],
      last:   ['Martin','Bernard','Thomas','Petit','Robert','Richard','Durand','Dubois','Moreau','Simon','Laurent','Lefebvre','Michel','Garcia','David','Bertrand','Roux','Vincent','Fournier','Morin','Girard','André','Mercier','Dupont','Lambert','Bonnet','François','Martinez','Legrand','Garnier']
    },
    'Japan': {
      male:   ['Haruto','Yuto','Sota','Yuki','Hayato','Haruki','Ryusei','Koki','Sora','Ren','Kaito','Hiroto','Shun','Minato','Itsuki','Takumi','Riku','Kento','Naoki','Kenji','Akira','Daisuke','Fumio','Genta','Hiroshi','Ichiro','Junpei','Kazuma','Makoto','Noriaki'],
      female: ['Yui','Hina','Rio','Yuna','Akari','Saki','Mio','Hana','Misaki','Aoi','Riko','Nana','Rin','Mei','Mitsuki','Sakura','Koharu','Noa','Yuka','Miho','Asahi','Chika','Emi','Fuyu','Hikari','Iroha','Kasumi','Kotone','Mayu','Nanami'],
      last:   ['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura','Kobayashi','Kato','Yoshida','Yamada','Sasaki','Yamaguchi','Matsumoto','Inoue','Kimura','Hayashi','Shimizu','Yamazaki','Mori','Abe','Ikeda','Hashimoto','Ishikawa','Ogawa','Maeda','Fujita','Okamoto','Goto']
    },
    'Brazil': {
      male:   ['Lucas','Gabriel','Matheus','Pedro','Guilherme','Felipe','Rafael','Vitor','Caio','Bruno','Augusto','Bernardo','Carlos','Davi','Eduardo','Fernando','Gustavo','Henrique','Igor','João','Leonardo','Marcos','Nicolas','Paulo','Ricardo','Rodrigo','Samuel','Thiago','Vinícius','Wagner'],
      female: ['Isabella','Sophia','Alice','Valentina','Manuela','Luísa','Heloísa','Larissa','Beatriz','Ana','Brenda','Camila','Daniela','Fernanda','Giovanna','Helena','Íris','Júlia','Lara','Marcela','Natália','Olívia','Patrícia','Rafaela','Sara','Thaís','Úrsula','Vitória','Yasmin','Zara'],
      last:   ['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes','Costa','Ribeiro','Martins','Carvalho','Almeida','Lopes','Sousa','Fernandes','Vieira','Barbosa','Rocha','Dias','Nascimento','Andrade','Moreira','Nunes','Marques','Machado','Mendes','Freitas']
    },
    'Mexico': {
      male:   ['José','Luis','Carlos','Juan','Miguel','Alejandro','Jesús','Antonio','Ricardo','Roberto','Abel','Armando','Bernardo','César','Daniel','Eduardo','Fernando','Gerardo','Héctor','Ignacio','Jorge','Kevin','Leonardo','Manuel','Nicolás','Omar','Pablo','Raúl','Sergio','Tomás'],
      female: ['María','Sofía','Valentina','Isabella','Camila','Fernanda','Daniela','Mariana','Valeria','Alejandra','Brenda','Carmen','Diana','Elena','Fabiola','Gabriela','Ingrid','Jimena','Karen','Leticia','Monica','Norma','Patricia','Rosa','Sandra','Teresa','Ursula','Verónica','Wendy','Ximena'],
      last:   ['García','Martínez','López','González','Hernández','Pérez','Sánchez','Ramírez','Torres','Flores','Rivera','Gómez','Díaz','Reyes','Morales','Cruz','Ortega','Jiménez','Vargas','Romero','Guerrero','Mendoza','Castillo','Moreno','Herrera','Medina','Vega','Delgado','Ríos','Gutiérrez']
    },
    'India': {
      male:   ['Arjun','Rahul','Rohan','Aditya','Vikram','Karan','Siddharth','Aarav','Ishaan','Vihaan','Abhimanyu','Bharat','Chetan','Dev','Eklavya','Farhan','Gaurav','Harsh','Ishan','Jatin','Kabir','Lakshman','Manav','Nikhil','Omkar','Prashant','Rajesh','Sanjay','Tarun','Uday'],
      female: ['Priya','Ananya','Neha','Divya','Kavya','Pooja','Riya','Siya','Trisha','Aanya','Aditi','Bhavna','Charu','Deepika','Esha','Fatima','Gauri','Hema','Ishita','Jyoti','Kajal','Lakshmi','Meera','Nisha','Ojasvi','Pallavi','Reena','Seema','Tara','Uma'],
      last:   ['Sharma','Patel','Singh','Kumar','Gupta','Joshi','Verma','Mehta','Shah','Chaudhary','Agarwal','Rao','Nair','Reddy','Iyer','Kapoor','Bose','Das','Chatterjee','Mishra','Malhotra','Pillai','Sinha','Saxena','Chopra','Banerjee','Ghosh','Murthy','Naidu','Pandey']
    },
    'South Africa': {
      male:   ['Thabo','Sipho','Bongani','Lungelo','Siyanda','Pieter','Christiaan','André','Ruan','Wilhelm','Blessing','Calvin','Desmond','Ethan','Fanele','Gift','Hlanganani','Ishmael','Jabulani','Khaya','Lethiwe','Mandla','Nhlanhla','Oluwaseun','Prince','Qhawe','Sandile','Themba','Unathi','Vusi'],
      female: ['Nomvula','Zinhle','Ayanda','Lindiwe','Busisiwe','Anke','Chantal','Elzette','Heidi','Ina','Johanna','Karien','Liezel','Marlene','Natasha','Petro','Riana','Sanelisiwe','Thandeka','Unathi','Amahle','Bongiwe','Duduzile','Fikile','Gcinile','Hlengiwe','Ntombifuthi','Phumzile','Sibongile','Zodwa'],
      last:   ['Dlamini','Ndlovu','Nkosi','Khumalo','Mthembu','Zulu','Mhlongo','Ntuli','Shabalala','Nxumalo','van der Merwe','Botha','Pretorius','du Plessis','Viljoen','Swanepoel','Coetzee','Joubert','Rousseau','de Wet','Osei','Mensah','Abiodun','Okafor','Adeyemi','Nwosu','Eze','Ike','Diallo','Mbeki']
    },
    'Nigeria': {
      male:   ['Emeka','Chidi','Tunde','Seun','Kunle','Chukwuemeka','Adebayo','Babatunde','Chinedu','Damilola','Eze','Femi','Gbenga','Hakeem','Ifeanyi','Jide','Kayode','Lanre','Musa','Ngozi','Obinna','Pelu','Rotimi','Sola','Tobi','Uche','Victor','Wale','Yemi','Zuberu'],
      female: ['Ngozi','Amaka','Chioma','Adaeze','Kemi','Abimbola','Blessing','Chidinma','Damilola','Eno','Funmilayo','Grace','Hauwa','Ijeoma','Jumoke','Kelechi','Latifat','Munirat','Nnenna','Oluwakemi','Peace','Rashidat','Sade','Titi','Uche','Vivian','Wunmi','Yetunde','Zinny','Aisha'],
      last:   ['Okafor','Adeyemi','Nwosu','Eze','Obi','Chukwu','Nwachukwu','Ike','Onwu','Uche','Balogun','Adeleke','Adesanya','Babatunde','Fadahunsi','Ibrahim','Jimoh','Lawal','Musa','Nzinga','Ogundipe','Salami','Taiwo','Usman','Yakubu','Abubakar','Bello','Danjuma','Garba','Hassan']
    },
    'Sweden': {
      male:   ['Lars','Erik','Anders','Johan','Karl','Per','Nils','Sven','Gustaf','Henrik','Axel','Björn','Carl','David','Emil','Fredrik','Gustav','Hugo','Isak','Joel','Kjell','Lennart','Magnus','Oscar','Patrik','Rasmus','Stefan','Tobias','Viktor','Wilhelm'],
      female: ['Astrid','Ingrid','Sigrid','Birgit','Anna','Maria','Karin','Eva','Helena','Kristina','Alva','Britta','Cecilia','Diana','Elsa','Frida','Gunilla','Hanna','Inger','Jenny','Kajsa','Linnea','Maja','Nora','Petra','Sofia','Ulrika','Vera','Wilma','Ylva'],
      last:   ['Johansson','Andersson','Karlsson','Nilsson','Eriksson','Larsson','Olsson','Persson','Svensson','Gustafsson','Pettersson','Jonsson','Jansson','Hansson','Bengtsson','Jönsson','Lindberg','Jakobsson','Magnusson','Olofsson','Lindström','Lindqvist','Lindgren','Berg','Axelsson','Bergström','Lundberg','Lundqvist','Mattsson','Lundgren']
    },
    'Spain': {
      male:   ['Carlos','Alejandro','Pablo','Miguel','Javier','Daniel','David','Adrián','Sergio','Fernando','Alberto','Antonio','Álvaro','Borja','César','Diego','Enrique','Francisco','Guillermo','Héctor','Ignacio','Jorge','Juan','Luis','Manuel','Nicolás','Óscar','Pedro','Rafael','Rubén'],
      female: ['Carmen','Isabel','María','Ana','Sofia','Lucia','Valentina','Marta','Laura','Paula','Adriana','Beatriz','Claudia','Diana','Elena','Fernanda','Gloria','Inés','Julia','Leire','Mónica','Natalia','Olga','Patricia','Raquel','Sandra','Teresa','Verónica','Xenia','Yolanda'],
      last:   ['García','Martínez','López','González','Rodríguez','Fernández','Sánchez','Pérez','Martín','Gómez','Ruiz','Hernández','Jiménez','Díaz','Moreno','Muñoz','Álvarez','Romero','Navarro','Torres','Domínguez','Vázquez','Ramos','Gil','Serrano','Blanco','Molina','Morales','Suárez','Guerrero']
    },
    'Italy': {
      male:   ['Marco','Luca','Alessandro','Francesco','Lorenzo','Andrea','Matteo','Davide','Giovanni','Roberto','Antonio','Bruno','Carlo','Daniele','Emanuele','Filippo','Giorgio','Giuseppe','Leonardo','Nicola','Paolo','Pietro','Raffaele','Riccardo','Simone','Stefano','Tommaso','Umberto','Vincenzo','Alberto'],
      female: ['Sofia','Giulia','Emma','Martina','Chiara','Alice','Francesca','Sara','Valentina','Aurora','Beatrice','Camilla','Claudia','Daniela','Elisa','Federica','Ginevra','Ilaria','Jessica','Laura','Melissa','Noemi','Paola','Rachele','Roberta','Serena','Silvia','Stefania','Valeria','Viviana'],
      last:   ['Rossi','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo','Conti','De Luca','Costa','Giordano','Mancini','Rizzo','Lombardi','Moretti','Barbieri','Fontana','Santoro','Marini','Rinaldi','Caruso','Ferrara','Gatti','Palumbo','Sanna','Fabbri']
    },
    'South Korea': {
      male:   ['Min-jun','Ji-ho','Seo-jun','Ye-jun','Do-yun','Si-woo','Joo-won','Jun-seo','Hyun-woo','Seung-jun','Bin','Chan','Da-won','Eun-ho','Gi-tae','Ha-neul','In-ho','Jae-won','Kang-min','Lee-jun','Min-su','Na-yeon','Oh-joon','Park-jin','Rae-won','Su-hyeon','Tae-yang','Woo-jin','Yong-jun','Zion'],
      female: ['Soo-yeon','Ji-yeon','Hye-jin','Min-ju','Yuna','Soo-bin','Ji-soo','Ha-eun','Ye-jin','Da-eun','Ah-reum','Bo-ra','Chae-won','Da-hye','Eun-ji','Ga-yeon','Ha-young','In-na','Ji-min','Kang-hee','Lee-na','Mi-rae','Na-yeon','Oh-yeon','Ri-na','Se-young','Tae-yeon','Woo-ri','Yeo-jin','Zi-yeon'],
      last:   ['Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon','Jang','Lim','Han','Oh','Seo','Shin','Kwon','Hwang','Ahn','Song','Yoo','Hong','Jeon','Ko','Moon','Bae','Heo','Nam','Sim','Noh','Ha','Gong']
    },
    'China': {
      male:   ['Wei','Ming','Jun','Hao','Tao','Fang','Lei','Jie','Kai','Bo','Changming','Dechang','Fenggang','Guangwei','Haoran','Jiaming','Kexin','Longwei','Mingzhi','Nian','Peng','Qilong','Renxiang','Sheng','Tianyi','Wanxiang','Xingchen','Yanlong','Zhihao','Zilong'],
      female: ['Xia','Ling','Mei','Fang','Yun','Li','Hui','Jing','Ping','Yan','Aijun','Bingbing','Chunhua','Dandan','Erjuan','Fenfang','Guiying','Haimei','Jianying','Keyan','Lianying','Meimei','Niuniu','Peijin','Qingqing','Rongrong','Shufen','Tianyi','Wangfang','Xiuying'],
      last:   ['Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhao','Wu','Zhou','Xu','Sun','Zhu','Ma','Hu','Guo','Lin','He','Gao','Liang','Zheng','Luo','Song','Xie','Tang','Han','Cao','Deng','Feng','Yu']
    },
    'Argentina': {
      male:   ['Santiago','Mateo','Benjamín','Bautista','Tomás','Valentín','Lautaro','Joaquín','Luciano','Facundo','Agustín','Bruno','Camilo','Dante','Emiliano','Franco','Gonzalo','Hernán','Ignacio','Juan','Kevin','Leonardo','Marcos','Nicolás','Octavio','Pablo','Ramiro','Rodrigo','Sebastián','Thiago'],
      female: ['Valentina','Lucía','Isabella','Sofía','Camila','Martina','Emma','Clara','Agustina','Catalina','Brisa','Candela','Delfina','Emilia','Florencia','Giuliana','Iara','Julieta','Lara','Malena','Natalia','Olivia','Pilar','Renata','Rocío','Selene','Teodora','Ursula','Violeta','Ximena'],
      last:   ['González','Rodríguez','Gómez','Fernández','López','Díaz','Martínez','Pérez','García','Sánchez','Romero','Sosa','Torres','Álvarez','Ruiz','Ramírez','Flores','Acosta','Medina','Ríos','Castro','Ortiz','Molina','Morales','Herrera','Suárez','Reyes','Gutiérrez','Luna','Vargas']
    },
    'Netherlands': {
      male:   ['Daan','Sem','Lars','Tim','Thomas','Milan','Jesse','Sander','Liam','Noah','Bram','Cas','Dylan','Finn','Gijs','Hidde','Joost','Kees','Luuk','Maarten','Nico','Piet','Ruben','Stef','Thijs','Victor','Wout','Yannick','Adriaan','Bas'],
      female: ['Emma','Sophie','Anna','Lotte','Sara','Mila','Nora','Fenna','Julie','Roos','Amber','Bo','Caro','Demi','Eva','Fleur','Gina','Hailey','Isa','Jade','Kim','Lisa','Manon','Nina','Olivia','Pien','Quinn','Stien','Vera','Zoë'],
      last:   ['de Vries','Janssen','van den Berg','van Dijk','Bakker','Visser','Smit','Meijer','de Boer','Mulder','de Groot','Bos','Vos','Peters','Hendriks','van Leeuwen','Dekker','Brouwer','de Jong','Kok','Vermeer','Linde','Hofman','de Wit','van Beek','Jansen','Claassen','Willems','van der Meer','Boer']
    },
    'New Zealand': {
      male:   ['James','Oliver','Jack','William','Noah','Liam','Mason','Hunter','Logan','Samuel','Arlo','Blake','Connor','Dante','Ethan','Flynn','George','Henry','Isaac','Jaxon','Kai','Leo','Max','Nathan','Ollie','Piripi','River','Sebastian','Tane','Zac'],
      female: ['Charlotte','Emma','Olivia','Isla','Amelia','Sophie','Lily','Grace','Ella','Isabella','Aroha','Brooklyn','Cleo','Daisy','Evie','Freya','Georgia','Hannah','Indi','Jade','Kate','Lola','Mia','Niamh','Pip','Quinn','Ruby','Summer','Tiana','Willow'],
      last:   ['Smith','Jones','Williams','Brown','Taylor','Wilson','Martin','Anderson','Thomas','White','Walker','Harris','Clark','Lewis','Robinson','Hall','Young','Moore','Scott','Baker','Thompson','Wright','Lee','Turner','Campbell','Mitchell','Davis','King','Evans','Collins']
    },
    'Colombia': {
      male:   ['Sebastián','Camilo','Felipe','Andrés','Juan','Santiago','Alejandro','David','Diego','Daniel','Bernardo','Carlos','Eduardo','Francisco','Gabriel','Hernán','Iván','Jorge','Kevin','Leonardo','Manuel','Nicolás','Omar','Pablo','Ricardo','Roberto','Sergio','Tomás','Victor','Wilmer'],
      female: ['Valeria','Daniela','Camila','Juliana','María','Alejandra','Isabella','Mariana','Natalia','Sofía','Andrea','Beatriz','Claudia','Diana','Elena','Fernanda','Gabriela','Ingrid','Jessica','Karen','Laura','Melissa','Natasha','Paola','Rebecca','Sara','Teresa','Valentina','Ximena','Yessica'],
      last:   ['Rodríguez','Gómez','García','López','Martínez','González','Hernández','Pérez','Sánchez','Ramírez','Torres','Díaz','Vargas','Castro','Morales','Jiménez','Ruiz','Reyes','Cruz','Ríos','Ortega','Medina','Ramos','Suárez','Guerrero','Mendoza','Herrera','Delgado','Vega','Luna']
    },
    'Chile': {
      male:   ['Matías','Tomás','Benjamín','Diego','Felipe','Sebastián','Nicolás','Ignacio','Francisco','Rodrigo','Agustín','Andrés','Bastián','Carlos','Daniel','Eduardo','Fabián','Gonzalo','Hernán','Iñigo','Jorge','Kevin','Leonardo','Mauricio','Nahuel','Oscar','Pablo','Renato','Victor','Waldo'],
      female: ['Sofía','Valentina','Catalina','Isadora','Florencia','Antonia','Javiera','Camila','Fernanda','Amanda','Belén','Constanza','Daniela','Emilia','Francisca','Gabriela','Ignacia','Josefina','Karla','Loreto','Macarena','Natalia','Oriana','Paola','Raquel','Solange','Trinidad','Ximena','Yasna','Zoe'],
      last:   ['Muñoz','González','Rojas','Díaz','Pérez','Soto','Contreras','Silva','Martínez','Sepúlveda','Morales','Rodríguez','López','Fuentes','Hernández','Torres','Araya','Flores','Espinoza','Valenzuela','Castillo','Ramírez','Reyes','Gutiérrez','Castro','Vargas','Álvarez','Vásquez','Fernández','Carrasco']
    },
    'Portugal': {
      male:   ['João','Pedro','Miguel','Tiago','André','Diogo','Francisco','Gonçalo','Luís','Nuno','Afonso','Bruno','Carlos','Dinis','Eduardo','Filipe','Henrique','Ivo','Jorge','Leandro','Mário','Nelson','Orlando','Paulo','Ricardo','Rodrigo','Sérgio','Tomás','Vítor','Xavier'],
      female: ['Maria','Ana','Sofia','Inês','Beatriz','Catarina','Margarida','Rita','Carolina','Francisca','Alice','Bárbara','Clara','Diana','Eduarda','Filipa','Gracinda','Helena','Isabel','Joana','Laura','Marta','Natalina','Olívia','Paula','Raquel','Sara','Teresa','Vera','Zulmira'],
      last:   ['Silva','Santos','Ferreira','Pereira','Oliveira','Costa','Rodrigues','Martins','Jesus','Sousa','Fernandes','Gonçalves','Lopes','Marques','Alves','Ribeiro','Cardoso','Mendes','Teixeira','Carvalho','Moreira','Correia','Pinto','Barbosa','Andrade','Nunes','Rocha','Miranda','Figueiredo','Guimarães']
    },
    'Norway': {
      male:   ['Oliver','William','Noah','Elias','Magnus','Oskar','Liam','Filip','Emil','Aksel','Anders','Bjørn','Christian','Dag','Eirik','Fredrik','Gunnar','Halvard','Ivar','Jon','Kristian','Lars','Martin','Nikolai','Ole','Pål','Rolf','Sigurd','Tor','Vegard'],
      female: ['Emma','Nora','Maja','Olivia','Emilie','Sofie','Ingrid','Frida','Astrid','Sigrid','Ane','Berit','Camilla','Dagny','Eli','Guro','Hege','Inger','Kari','Lene','Marit','Nina','Oda','Randi','Silje','Tonje','Unni','Vibeke','Wenche','Ylva'],
      last:   ['Hansen','Johansen','Olsen','Larsen','Andersen','Nilsen','Jakobsen','Moen','Christoffersen','Pettersen','Eriksen','Berg','Haugen','Hagen','Johannessen','Andreassen','Pedersen','Dahl','Henriksen','Halvorsen','Karlsen','Sørensen','Lie','Sundberg','Lund','Nguyen','Lindberg','Bakke','Strand','Nygaard']
    },
    'Denmark': {
      male:   ['Liam','Noah','Emil','Mikkel','Oliver','Lucas','Oscar','Felix','Elias','Anton','Anders','Bjarne','Christian','Dag','Erik','Frederik','Gunnar','Hans','Ib','Jakob','Klaus','Lars','Mads','Niels','Ole','Poul','Rasmus','Søren','Thomas','Ulrik'],
      female: ['Emma','Freja','Ella','Ida','Sofia','Clara','Cecilie','Maja','Sara','Alma','Anne','Birthe','Dorthe','Else','Grethe','Hanne','Inga','Johanne','Karen','Lene','Mette','Nina','Oda','Pernille','Rikke','Sine','Tine','Ulla','Vibeke','Winnie'],
      last:   ['Nielsen','Jensen','Hansen','Pedersen','Andersen','Christensen','Larsen','Sørensen','Rasmussen','Jørgensen','Petersen','Madsen','Kristensen','Olsen','Thomsen','Christiansen','Poulsen','Johansen','Koch','Møller','Mortensen','Eriksen','Clausen','Holm','Simonsen','Lund','Schmidt','Jacobsen','Dahl','Knudsen']
    },
    'Belgium': {
      male:   ['Liam','Noah','Elias','Arthur','Victor','Louis','Remi','Lucas','Axel','Nathan','Alexandre','Baptiste','Christophe','David','Ethan','François','Gilles','Henri','Julien','Kevin','Laurent','Mathieu','Nicolas','Olivier','Philippe','Quentin','Renaud','Stéphane','Thomas','Xavier'],
      female: ['Emma','Olivia','Nora','Julie','Sarah','Elise','Lina','Sofia','Charlotte','Alice','Amelie','Brigitte','Caroline','Delphine','Elodie','Françoise','Gaëlle','Hanne','Ingrid','Jolien','Karen','Lore','Marie','Nathalie','Petra','Roos','Sofie','Tinne','Valerie','Yasmine'],
      last:   ['Peeters','Janssen','Maes','Jacobs','Mertens','Willems','Claes','Goossens','Leclercq','Dubois','Lambert','Simon','Laurent','Dupont','Thomas','Lecomte','Renard','Dumont','Piron','Adam','De Smedt','Hermans','Declercq','Bogaert','Verbeke','Lemmens','Aerts','Cools','Vermeulen','Smeets']
    },
  };

  // Helper to get name pool for a country (falls back to global pools)
  function getCountryNamePool(country) {
    if (!country) return { male: MALE_NAMES, female: FEMALE_NAMES, last: LAST_NAMES };
    const pool = COUNTRY_NAMES[country.name];
    if (!pool) return { male: MALE_NAMES, female: FEMALE_NAMES, last: LAST_NAMES };
    return pool;
  }

  // ── Countries — doubleSurname marks Spanish-naming tradition, hasRoyalty marks monarchies ──
  const COUNTRIES = [
    { name:'United States',  flag:'US', wealthMod:1.2,  doubleSurname:false },
    { name:'United Kingdom', flag:'UK', wealthMod:1.1,  doubleSurname:false, hasRoyalty:true,  royalMaleName:'Prince',  royalFemaleName:'Princess' },
    { name:'Canada',         flag:'CA', wealthMod:1.1,  doubleSurname:false },
    { name:'Australia',      flag:'AU', wealthMod:1.1,  doubleSurname:false },
    { name:'Germany',        flag:'DE', wealthMod:1.0,  doubleSurname:false },
    { name:'France',         flag:'FR', wealthMod:1.0,  doubleSurname:false },
    { name:'Japan',          flag:'JP', wealthMod:1.0,  doubleSurname:false, hasRoyalty:true,  royalMaleName:'Prince',  royalFemaleName:'Princess' },
    { name:'Brazil',         flag:'BR', wealthMod:0.8,  doubleSurname:true  },
    { name:'Mexico',         flag:'MX', wealthMod:0.75, doubleSurname:true  },
    { name:'India',          flag:'IN', wealthMod:0.6,  doubleSurname:false },
    { name:'South Africa',   flag:'ZA', wealthMod:0.65, doubleSurname:false },
    { name:'Nigeria',        flag:'NG', wealthMod:0.55, doubleSurname:false },
    { name:'Sweden',         flag:'SE', wealthMod:1.1,  doubleSurname:false, hasRoyalty:true,  royalMaleName:'Prince',  royalFemaleName:'Princess' },
    { name:'Spain',          flag:'ES', wealthMod:0.9,  doubleSurname:true,  hasRoyalty:true,  royalMaleName:'Infante', royalFemaleName:'Infanta'  },
    { name:'Italy',          flag:'IT', wealthMod:0.9,  doubleSurname:false },
    { name:'South Korea',    flag:'KR', wealthMod:1.0,  doubleSurname:false },
    { name:'China',          flag:'CN', wealthMod:0.85, doubleSurname:false },
    { name:'Argentina',      flag:'AR', wealthMod:0.7,  doubleSurname:true  },
    { name:'Netherlands',    flag:'NL', wealthMod:1.1,  doubleSurname:false, hasRoyalty:true,  royalMaleName:'Prince',  royalFemaleName:'Princess' },
    { name:'New Zealand',    flag:'NZ', wealthMod:1.05, doubleSurname:false },
    { name:'Colombia',       flag:'CO', wealthMod:0.65, doubleSurname:true  },
    { name:'Chile',          flag:'CL', wealthMod:0.75, doubleSurname:true  },
    { name:'Portugal',       flag:'PT', wealthMod:0.85, doubleSurname:true  },
    { name:'Norway',         flag:'NO', wealthMod:1.15, doubleSurname:false, hasRoyalty:true,  royalMaleName:'Prince',  royalFemaleName:'Princess' },
    { name:'Denmark',        flag:'DK', wealthMod:1.1,  doubleSurname:false, hasRoyalty:true,  royalMaleName:'Prince',  royalFemaleName:'Princess' },
    { name:'Belgium',        flag:'BE', wealthMod:1.05, doubleSurname:false, hasRoyalty:true,  royalMaleName:'Prince',  royalFemaleName:'Princess' },
  ];

  const WEALTH_CLASSES = [
    { id:'impoverished', label:'Impoverished', startMoney:100,    startBonus:-10 },
    { id:'lower',        label:'Lower Class',  startMoney:500,    startBonus:-5  },
    { id:'middle',       label:'Middle Class', startMoney:2000,   startBonus:0   },
    { id:'upper-middle', label:'Upper-Middle', startMoney:8000,   startBonus:5   },
    { id:'wealthy',      label:'Wealthy',      startMoney:40000,  startBonus:10  },
    { id:'ultra-rich',   label:'Ultra-Rich',   startMoney:500000, startBonus:15  },
  ];

  const TRAITS = ['kind','funny','ambitious','shy','outgoing','stubborn','creative',
    'loyal','sarcastic','adventurous','lazy','caring','impulsive','intelligent','charming'];

  // ── Family name generation ──────────────────────────────────────
  // Handles both single-surname and double-surname traditions
  function generateFamilyNames(customLastName, country) {
    const useDouble = country && country.doubleSurname;
    const lastPool  = getCountryNamePool(country).last;

    if (useDouble) {
      // Double-surname tradition (Spain, Mexico, etc.)
      // Child surname = paternal_1 + maternal_1
      const pat1 = customLastName || randomFrom(lastPool);
      const pat2 = randomFrom(lastPool.filter(n => n !== pat1));
      const mat1 = randomFrom(lastPool.filter(n => n !== pat1 && n !== pat2));
      const mat2 = randomFrom(lastPool.filter(n => n !== mat1 && n !== pat1));
      return {
        childSurname: `${pat1} ${mat1}`,
        fatherSurname: `${pat1} ${pat2}`,
        motherSurname: `${mat1} ${mat2}`,
        siblingSurname: `${pat1} ${mat1}`,
        doubleSurname: true,
      };
    } else {
      // Single-surname tradition (US, UK, etc.)
      // Everyone uses the father's last name; mother keeps maiden name
      const familySurname = customLastName || randomFrom(lastPool);
      const motherMaiden  = randomFrom(lastPool.filter(n => n !== familySurname));
      return {
        childSurname: familySurname,
        fatherSurname: familySurname,
        motherSurname: motherMaiden,
        siblingSurname: familySurname,
        doubleSurname: false,
      };
    }
  }

  // ── Hobbies ────────────────────────────────────────────────────
  // category: 'artistic'|'physical'|'mental'|'mixed'
  // careerBoost: career ids that benefit from this hobby
  // statGains: base gains when practicing (per session)
  const HOBBIES = [
    {
      id: 'music',
      name: 'Music',
      shortLabel: 'Music',
      desc: 'Learn an instrument, compose songs, or sing.',
      minAge: 5,
      category: 'artistic',
      icon: 'Mu',
      iconClass: 'ic-purple',
      statGains: { smarts:2, happiness:3 },
      careerBoost: ['musician','music_producer','dancer','actor','comedian'],
    },
    {
      id: 'drawing',
      name: 'Drawing & Painting',
      shortLabel: 'Drawing',
      desc: 'Sketch, paint, and explore visual creativity.',
      minAge: 4,
      category: 'artistic',
      icon: 'Art',
      iconClass: 'ic-rose',
      statGains: { smarts:2, looks:1, happiness:2 },
      careerBoost: ['visual_artist','graphic_designer','tattoo_artist','animator','filmmaker','fashion_designer'],
    },
    {
      id: 'dance',
      name: 'Dance',
      shortLabel: 'Dance',
      desc: 'Ballet, contemporary, hip-hop — move your body.',
      minAge: 4,
      category: 'mixed',
      icon: 'Dn',
      iconClass: 'ic-rose',
      statGains: { health:3, looks:2, happiness:2 },
      careerBoost: ['dancer','actor','comedian'],
    },
    {
      id: 'writing',
      name: 'Creative Writing',
      shortLabel: 'Writing',
      desc: 'Write stories, poems, and journal entries.',
      minAge: 7,
      category: 'artistic',
      icon: 'Wr',
      iconClass: 'ic-blue',
      statGains: { smarts:3, happiness:2 },
      careerBoost: ['novelist','journalist','screenwriter','content_creator'],
    },
    {
      id: 'sports',
      name: 'Sports',
      shortLabel: 'Sports',
      desc: 'Football, swimming, tennis — stay competitive.',
      minAge: 5,
      category: 'physical',
      icon: 'Sp',
      iconClass: 'ic-green',
      statGains: { health:5, happiness:2 },
      careerBoost: [],
    },
    {
      id: 'theater',
      name: 'Theater',
      shortLabel: 'Theater',
      desc: 'Act in school plays and local productions.',
      minAge: 7,
      category: 'artistic',
      icon: 'Th',
      iconClass: 'ic-amber',
      statGains: { happiness:3, smarts:2, looks:1 },
      careerBoost: ['actor','comedian','voice_actor','dancer'],
    },
    {
      id: 'photography',
      name: 'Photography',
      shortLabel: 'Photo',
      desc: 'Capture the world through a lens.',
      minAge: 8,
      category: 'artistic',
      icon: 'Ph',
      iconClass: 'ic-teal',
      statGains: { smarts:2, happiness:2 },
      careerBoost: ['photographer','filmmaker','content_creator'],
    },
    {
      id: 'coding',
      name: 'Coding',
      shortLabel: 'Coding',
      desc: 'Build apps, games, and websites.',
      minAge: 9,
      category: 'mental',
      icon: 'Co',
      iconClass: 'ic-blue',
      statGains: { smarts:5 },
      careerBoost: ['engineer','game_designer','content_creator'],
    },
    {
      id: 'yoga',
      name: 'Yoga & Wellness',
      shortLabel: 'Yoga',
      desc: 'Find inner calm through movement and meditation.',
      minAge: 8,
      category: 'physical',
      icon: 'Yo',
      iconClass: 'ic-teal',
      statGains: { health:3, happiness:4 },
      careerBoost: [],
    },
    {
      id: 'fashion',
      name: 'Fashion & Style',
      shortLabel: 'Fashion',
      desc: 'Design outfits and develop your personal style.',
      minAge: 8,
      category: 'artistic',
      icon: 'Fa',
      iconClass: 'ic-rose',
      statGains: { looks:3, happiness:2 },
      careerBoost: ['fashion_designer','graphic_designer','actor','tattoo_artist'],
    },
    {
      id: 'filmmaking',
      name: 'Filmmaking',
      shortLabel: 'Film',
      desc: 'Write scripts and make short films.',
      minAge: 10,
      category: 'artistic',
      icon: 'Fi',
      iconClass: 'ic-orange',
      statGains: { smarts:3, happiness:2 },
      careerBoost: ['filmmaker','actor','screenwriter','content_creator','photographer'],
    },
  ];

  // ── Extracurriculars ───────────────────────────────────────────
  // Available during school years (age 6–18)
  // hobbyBoost: hobby ids whose skill accelerates participation gains
  // careerBoost: career ids that benefit when applying for jobs
  const EXTRACURRICULARS = [
    {
      id: 'sports_team', name: 'Sports Team', icon: 'Sp', iconClass: 'ic-green',
      desc: 'Compete for your school on the field or court.',
      minAge: 8, maxAge: 18,
      statGains: { health: 4, happiness: 3 },
      hobbyBoost: ['sports'],
      careerBoost: [],
    },
    {
      id: 'music_band', name: 'School Band', icon: 'Mu', iconClass: 'ic-purple',
      desc: 'Play in the school orchestra or jazz ensemble.',
      minAge: 8, maxAge: 18,
      statGains: { smarts: 2, happiness: 3 },
      hobbyBoost: ['music'],
      careerBoost: ['musician', 'music_producer'],
    },
    {
      id: 'drama_club', name: 'Drama Club', icon: 'Th', iconClass: 'ic-amber',
      desc: 'Act in school plays and musicals.',
      minAge: 8, maxAge: 18,
      statGains: { happiness: 3, looks: 1, smarts: 1 },
      hobbyBoost: ['theater', 'dance'],
      careerBoost: ['actor', 'comedian', 'voice_actor'],
    },
    {
      id: 'art_club', name: 'Art Club', icon: 'Art', iconClass: 'ic-rose',
      desc: 'Create paintings, sculptures, and mixed media.',
      minAge: 6, maxAge: 18,
      statGains: { smarts: 2, happiness: 2, looks: 1 },
      hobbyBoost: ['drawing', 'fashion', 'photography'],
      careerBoost: ['visual_artist', 'graphic_designer', 'fashion_designer'],
    },
    {
      id: 'debate_team', name: 'Debate Team', icon: 'Db', iconClass: 'ic-blue',
      desc: 'Argue your case and sharpen your mind.',
      minAge: 12, maxAge: 18,
      statGains: { smarts: 5, happiness: 1 },
      hobbyBoost: ['writing'],
      careerBoost: ['lawyer', 'journalist', 'corporate_manager'],
    },
    {
      id: 'coding_club', name: 'Coding Club', icon: 'Co', iconClass: 'ic-blue',
      desc: 'Build apps and games with classmates.',
      minAge: 10, maxAge: 18,
      statGains: { smarts: 5 },
      hobbyBoost: ['coding'],
      careerBoost: ['engineer', 'game_designer', 'content_creator'],
    },
    {
      id: 'dance_team', name: 'Dance Team', icon: 'Dn', iconClass: 'ic-rose',
      desc: 'Choreograph and perform at school events.',
      minAge: 8, maxAge: 18,
      statGains: { health: 3, looks: 2, happiness: 2 },
      hobbyBoost: ['dance', 'theater'],
      careerBoost: ['dancer', 'actor'],
    },
    {
      id: 'literary_mag', name: 'Literary Magazine', icon: 'Wr', iconClass: 'ic-teal',
      desc: 'Write stories, poems, and articles for the school paper.',
      minAge: 10, maxAge: 18,
      statGains: { smarts: 4, happiness: 1 },
      hobbyBoost: ['writing'],
      careerBoost: ['novelist', 'journalist', 'screenwriter'],
    },
    {
      id: 'photo_club', name: 'Photography Club', icon: 'Ph', iconClass: 'ic-teal',
      desc: 'Shoot and develop photos for the yearbook.',
      minAge: 10, maxAge: 18,
      statGains: { smarts: 2, happiness: 2 },
      hobbyBoost: ['photography', 'filmmaking'],
      careerBoost: ['photographer', 'filmmaker', 'content_creator'],
    },
    {
      id: 'student_council', name: 'Student Council', icon: 'SC', iconClass: 'ic-amber',
      desc: 'Lead school initiatives and represent your peers.',
      minAge: 12, maxAge: 18,
      statGains: { smarts: 3, happiness: 2 },
      hobbyBoost: [],
      careerBoost: ['corporate_manager', 'lawyer', 'hr_manager', 'teacher'],
    },
    {
      id: 'volunteer_club', name: 'Volunteer Club', icon: 'Vo', iconClass: 'ic-green',
      desc: 'Give back to the community through service.',
      minAge: 10, maxAge: 18,
      statGains: { happiness: 4, smarts: 1 },
      hobbyBoost: [],
      careerBoost: ['nurse', 'teacher'],
    },
    {
      id: 'chess_club', name: 'Chess Club', icon: 'Ch', iconClass: 'ic-blue',
      desc: 'Tournament chess and strategic thinking.',
      minAge: 8, maxAge: 18,
      statGains: { smarts: 6 },
      hobbyBoost: ['coding'],
      careerBoost: ['engineer', 'financial_analyst', 'lawyer'],
    },
    {
      id: 'film_club', name: 'Film Club', icon: 'Fi', iconClass: 'ic-orange',
      desc: 'Direct short films and study cinema.',
      minAge: 12, maxAge: 18,
      statGains: { smarts: 3, happiness: 2 },
      hobbyBoost: ['filmmaking', 'photography'],
      careerBoost: ['filmmaker', 'screenwriter', 'content_creator'],
    },
    {
      id: 'lgbtq_club', name: 'GSA / Pride Club', icon: 'Pr', iconClass: 'ic-rose',
      desc: 'A safe space for LGBTQ+ students and allies.',
      minAge: 12, maxAge: 18,
      statGains: { happiness: 6 },
      hobbyBoost: [],
      careerBoost: [],
    },
  ];

  // ── Sexuality / Identity ────────────────────────────────────────
  const SEXUALITIES = [
    { id: 'straight',  label: 'Straight'   },
    { id: 'gay',       label: 'Gay / Lesbian' },
    { id: 'bisexual',  label: 'Bisexual'   },
    { id: 'pansexual', label: 'Pansexual'  },
    { id: 'asexual',   label: 'Asexual'    },
  ];

  const GENDER_IDENTITIES = [
    { id: 'cis',         label: 'Cisgender'   },
    { id: 'trans',       label: 'Transgender' },
    { id: 'nonbinary',   label: 'Non-binary'  },
    { id: 'genderfluid', label: 'Genderfluid' },
  ];

  // Returns the gender the character is attracted to (for romance)
  function getAttractedGender(charGender, sexuality) {
    switch(sexuality) {
      case 'gay': return charGender;
      case 'bisexual':
      case 'pansexual': return Math.random() < 0.5 ? 'male' : 'female';
      case 'asexual': return null;
      default: return charGender === 'male' ? 'female' : 'male';
    }
  }

  // Career bonus from extracurriculars (0.0–1.0, stacks with hobby bonus)
  function getExtracurricularCareerBonus(extracurriculars, careerId) {
    if (!extracurriculars || extracurriculars.length === 0) return 0;
    let best = 0;
    for (const entry of extracurriculars) {
      const def = EXTRACURRICULARS.find(e => e.id === entry.id);
      if (!def) continue;
      if (def.careerBoost.includes(careerId)) {
        best = Math.max(best, entry.skillLevel);
      }
    }
    return best / 100;
  }

  function getExtracurricular(id) { return EXTRACURRICULARS.find(e => e.id === id) || null; }
  function getAllExtracurriculars() { return EXTRACURRICULARS; }

  // ── Events ─────────────────────────────────────────────────────
  // category: used to style the event modal badge
  const EVENTS = [
    // ── INFANT ────────────────────────────────────────────────────
    {
      id:'first_steps', title:'First Steps', stage:'infant', weight:8, once:true,
      category:'family',
      desc:'You take your very first steps. Your parents erupt in cheers.',
      choices: null,
      effects:{ happiness:8 }, log:'You took your first steps.'
    },
    {
      id:'first_word', title:'First Words', stage:'infant', weight:8, once:true,
      category:'family',
      desc:'Your first word breaks the silence. "No!"',
      choices: null,
      effects:{ happiness:5, smarts:3 }, log:'Your first word was "No!" — a sign of things to come.'
    },
    {
      id:'baby_sick', title:'Under the Weather', stage:'infant', weight:6,
      category:'health',
      desc:'You spike a high fever. Mom and Dad are up all night.',
      choices: null,
      effects:{ health:-12, happiness:-5 }, log:'You were sick with a fever.'
    },
    {
      id:'baby_new_sibling', title:'New Sibling', stage:'infant', weight:4, once:true,
      category:'family',
      desc:'A new baby sibling arrives and immediately steals all the attention.',
      choices:[
        { text:'Excited to have a sibling', sub:'Happy days ahead', effects:{ happiness:10 } },
        { text:'Not a fan of sharing parents', sub:'Green with jealousy', effects:{ happiness:-5 } },
      ]
    },
    {
      id:'baby_birthday', title:'Birthday Party', stage:'infant', weight:7,
      category:'social',
      desc:'Your parents throw you a birthday party. You eat most of the cake off the floor.',
      choices: null,
      effects:{ happiness:12 }, log:'You had a birthday party.'
    },
    {
      id:'baby_fall', title:'Playground Tumble', stage:'infant', weight:5,
      category:'health',
      desc:'You fall off the playground equipment and scrape your knees.',
      choices: null,
      effects:{ health:-8, happiness:-5 }, log:'You took a nasty tumble at the playground.'
    },
    {
      id:'baby_pet', title:'New Pet', stage:'infant', weight:5, once:true,
      category:'family',
      desc:'Your family gets a dog. You are immediately obsessed.',
      choices: null,
      effects:{ happiness:15 }, log:'Your family got a dog.'
    },
    {
      id:'baby_vaccination', title:'Vaccination Day', stage:'infant', weight:6,
      category:'health',
      desc:'Time for your vaccinations. The nurse approaches...',
      choices:[
        { text:'Be brave about it', sub:'Builds character', effects:{ health:5, smarts:2 } },
        { text:'Cry dramatically', sub:'The whole waiting room hears', effects:{ health:5, happiness:-3 } },
      ]
    },

    // ── CHILD ─────────────────────────────────────────────────────
    {
      id:'child_first_day', title:'First Day of School', stage:'child', weight:10, once:true,
      category:'school',
      desc:'The big yellow bus arrives. Your childhood officially begins.',
      choices:[
        { text:'Introduce yourself to everyone', sub:'Social butterfly', effects:{ happiness:8, smarts:3 } },
        { text:'Find a quiet seat and read', sub:'Bookworm energy', effects:{ smarts:8, happiness:3 } },
      ]
    },
    {
      id:'child_best_friend', title:'Best Friend Found', stage:'child', weight:8,
      category:'social',
      desc:'You and a classmate click immediately. Inseparable ever since.',
      choices: null,
      effects:{ happiness:12 }, log:'You made a best friend at school.', addFriend:true
    },
    {
      id:'child_bully', title:'The Bully', stage:'child', weight:6,
      category:'social',
      desc:'A bigger kid has been giving you trouble at recess.',
      choices:[
        { text:'Stand up to them', sub:'Risky but brave', effects:{ happiness:8, health:-5 } },
        { text:'Tell a teacher', sub:'Smart call', effects:{ happiness:5, smarts:3 } },
        { text:'Ignore it', sub:'Suffer quietly', effects:{ happiness:-10 } },
      ]
    },
    {
      id:'child_spelling_bee', title:'Spelling Bee', stage:'child', weight:5,
      category:'school',
      desc:"You're entered in the school spelling bee. Everyone is watching.",
      choices:[
        { text:'Study hard beforehand', sub:'+Smarts boost', effects:{ smarts:10, happiness:12 } },
        { text:'Wing it', sub:'Might backfire', effects:{ smarts:3, happiness:-3 } },
      ]
    },
    {
      id:'child_report_card', title:'Report Card', stage:'child', weight:9,
      category:'school',
      desc:'Your grades arrive in the mail. Your parents open the envelope.',
      choices: null,
      smartsCheck:true,
      log:'Your report card arrived.'
    },
    {
      id:'child_sports', title:'Sports Tryouts', stage:'child', weight:6,
      category:'school',
      desc:'Your school is holding tryouts for the sports team.',
      choices:[
        { text:'Try out!', sub:'Show what you have got', effects:{ health:8, happiness:8 } },
        { text:'Skip it', sub:'Not your thing', effects:{ happiness:-2 } },
      ]
    },
    {
      id:'child_moved', title:'We Are Moving', stage:'child', weight:4,
      category:'family',
      desc:"Your parents announce the family is moving to a new town. Everything you know will change.",
      choices: null,
      effects:{ happiness:-12 }, log:'Your family moved to a new town.'
    },
    {
      id:'child_parents_argue', title:'Home Troubles', stage:'child', weight:4,
      category:'family',
      desc:'Your parents have been fighting a lot lately. The tension at home is thick.',
      choices:[
        { text:'Stay out of it', sub:'Try to block it out', effects:{ happiness:-8 } },
        { text:'Escape into hobbies', sub:'Find solace in creativity', effects:{ happiness:-3, smarts:3 } },
      ]
    },
    {
      id:'child_book_prize', title:'Reading Award', stage:'child', weight:5,
      category:'school',
      desc:'You read more books than anyone in your class and win the library award.',
      choices: null,
      effects:{ smarts:8, happiness:8 }, log:'You won the school reading award.'
    },
    {
      id:'child_grounded', title:'Grounded', stage:'child', weight:5,
      category:'family',
      desc:'You broke something expensive while goofing around. Grounded for two weeks.',
      choices: null,
      effects:{ happiness:-10 }, log:'You got grounded for two weeks.'
    },

    // ── TEEN ──────────────────────────────────────────────────────
    {
      id:'teen_first_crush', title:'First Crush', stage:'teen', weight:8, once:true,
      category:'social',
      desc:'You develop a serious crush on someone at school. Your heart does backflips.',
      choices:[
        { text:'Tell them how you feel', sub:'Bold move', effects:{ happiness:15 }, addCrush:true },
        { text:'Keep it a secret', sub:'Safe but bittersweet', effects:{ happiness:5 }, addCrush:true },
      ]
    },
    {
      id:'teen_first_kiss', title:'First Kiss', stage:'teen', weight:6, once:true,
      category:'social',
      desc:'Under the bleachers after the game. Time stops.',
      choices: null,
      effects:{ happiness:18 }, log:'You had your first kiss.'
    },
    {
      id:'teen_peer_pressure', title:'Peer Pressure', stage:'teen', weight:7,
      category:'social',
      desc:'"Come on, everyone is doing it." Your friends push something your way.',
      choices:[
        { text:'Refuse firmly', sub:'Stay clean', effects:{ health:3, smarts:3, happiness:-3 } },
        { text:'Try it once', sub:'YOLO, sort of', effects:{ health:-8, happiness:8 } },
      ]
    },
    {
      id:'teen_prom', title:'Prom Night', stage:'teen', weight:7, once:true,
      category:'social',
      desc:"It is prom season. The biggest social event of high school.",
      choices:[
        { text:'Get a date and go all out', sub:'Classic prom experience', effects:{ happiness:15, looks:3 } },
        { text:'Go with a group of friends', sub:'More fun, less drama', effects:{ happiness:12 } },
        { text:'Skip it entirely', sub:'Just a party', effects:{ happiness:-5, smarts:5 } },
      ]
    },
    {
      id:'teen_part_time_job', title:'Part-Time Job', stage:'teen', weight:7, once:true,
      category:'career',
      desc:'You land your first part-time job. Minimum wage, maximum drama.',
      choices: null,
      effects:{ money:1200, happiness:8 }, log:'You started your first part-time job.'
    },
    {
      id:'teen_breakup', title:'Heartbreak', stage:'teen', weight:5,
      category:'social',
      desc:'Your crush starts dating someone else. Three sad journal entries in one night.',
      choices: null,
      effects:{ happiness:-15 }, log:'You experienced heartbreak for the first time.'
    },
    {
      id:'teen_academic_award', title:'Academic Award', stage:'teen', weight:5,
      category:'school',
      desc:'Your teachers nominate you for the academic excellence award.',
      choices: null,
      effects:{ smarts:5, happiness:10 }, log:'You won an academic excellence award.'
    },
    {
      id:'teen_drivers_license', title:"Driver's License", stage:'teen', weight:7, once:true, minAge:16,
      category:'adventure',
      desc:'You pass your driver test on the second try. Freedom at last.',
      choices: null,
      effects:{ happiness:12 }, log:"You got your driver's license."
    },
    {
      id:'teen_fight', title:'Got into a Fight', stage:'teen', weight:4,
      category:'social',
      desc:'A confrontation at school escalates. Not your finest hour.',
      choices:[
        { text:'Fight back hard', sub:'You gave as good as you got', effects:{ health:-10, happiness:3 } },
        { text:'Walk away', sub:'Discretion wins', effects:{ health:-3, smarts:5 } },
      ]
    },
    {
      id:'teen_hobby_discovery', title:'Creative Discovery', stage:'teen', weight:7,
      category:'adventure',
      desc:'You stumble onto something you love doing. It feels right.',
      choices:[
        { text:'Dive into music', sub:'Pluck that guitar', effects:{ happiness:12, smarts:3 } },
        { text:'Start drawing', sub:'Sketchbook in hand', effects:{ happiness:10, looks:2 } },
        { text:'Begin writing', sub:'The blank page calls', effects:{ happiness:8, smarts:5 } },
      ]
    },

    // ── YOUNG ADULT ───────────────────────────────────────────────
    {
      id:'ya_first_apartment', title:'First Apartment', stage:'young_adult', weight:7, once:true,
      category:'adventure',
      desc:'You sign the lease on your very first apartment. It smells like old carpet and freedom.',
      choices: null,
      effects:{ happiness:15, money:-1500 }, log:'You moved into your first apartment.'
    },
    {
      id:'ya_college_party', title:'College Party', stage:'young_adult', weight:7,
      category:'social',
      desc:'Your roommate drags you to the biggest house party of the semester.',
      choices:[
        { text:'Go all in', sub:'Live your best life', effects:{ happiness:12, health:-8 } },
        { text:'Stay a little while', sub:'Responsible fun', effects:{ happiness:6 } },
        { text:'Stay in and study', sub:'Nerd mode activated', effects:{ smarts:8, happiness:-3 } },
      ]
    },
    {
      id:'ya_internship', title:'Internship Offer', stage:'young_adult', weight:6,
      category:'career',
      desc:'A company offers you a summer internship. Unpaid, but it looks great on a resume.',
      choices:[
        { text:'Take it', sub:'Build experience', effects:{ smarts:6, money:500 } },
        { text:'Pass — get a paying job', sub:'Bills first', effects:{ money:2000, happiness:3 } },
      ]
    },
    {
      id:'ya_broke', title:'Dead Broke', stage:'young_adult', weight:5,
      category:'health',
      desc:'Your bank account reads $0.00. Ramen for two weeks straight.',
      choices: null,
      effects:{ happiness:-15, health:-5 }, log:'You ran out of money and survived on ramen.'
    },
    {
      id:'ya_fall_in_love', title:'Fall in Love', stage:'young_adult', weight:7,
      category:'social',
      desc:'You meet someone remarkable and feel something new.',
      choices:[
        { text:'Go for it', sub:'Put your heart out there', effects:{ happiness:20 }, addPartner:true },
        { text:'Play it cool', sub:'Protect yourself', effects:{ happiness:8 } },
      ]
    },
    {
      id:'ya_startup', title:'Startup Dream', stage:'young_adult', weight:4,
      category:'career',
      desc:'Your friend has a wild startup idea and wants you to co-found it.',
      choices:[
        { text:'Join the startup', sub:'High risk, high reward', effects:{ smarts:5, money:-3000, happiness:10 } },
        { text:'Stick to the safe path', sub:'Steady wins', effects:{ happiness:-3 } },
      ]
    },
    {
      id:'ya_travel', title:'Summer in Europe', stage:'young_adult', weight:5,
      category:'adventure',
      desc:'With a rail pass and a small backpack, you spend the summer in Europe.',
      choices:[
        { text:'Go for it', sub:'Adventure awaits', effects:{ happiness:20, smarts:5, money:-4000 } },
        { text:'Save the money instead', sub:'Practical choice', effects:{ money:3000 } },
      ]
    },
    {
      id:'ya_failed_exam', title:'Failed an Exam', stage:'young_adult', weight:6,
      category:'school',
      desc:'You bombed the midterm. The grade is circled in red.',
      choices:[
        { text:'Hit the books hard', sub:'Redeem yourself', effects:{ smarts:5, happiness:-5 } },
        { text:'Pretend it never happened', sub:'Risky move', effects:{ smarts:-5, happiness:-8 } },
      ]
    },

    // ── ADULT ─────────────────────────────────────────────────────
    {
      id:'adult_promotion', title:'Promotion Offer', stage:'adult', weight:8,
      category:'career',
      desc:'Your boss calls you in. There is a promotion on the table.',
      choices:[
        { text:'Accept the promotion', sub:'More money, more responsibility', effects:{ happiness:15, money:5000 } },
        { text:'Negotiate for more', sub:'Know your worth', effects:{ happiness:12, money:8000, smarts:3 } },
      ]
    },
    {
      id:'adult_health_scare', title:'Health Scare', stage:'adult', weight:6,
      category:'health',
      desc:'You notice some worrying symptoms. Your doctor recommends further tests.',
      choices:[
        { text:'Go to all appointments', sub:'Better safe than sorry', effects:{ health:5, money:-2000, happiness:-5 } },
        { text:'Ignore it', sub:'It will probably go away', effects:{ health:-15, happiness:-5 } },
      ]
    },
    {
      id:'adult_investment', title:'Hot Investment Tip', stage:'adult', weight:6,
      category:'adventure',
      desc:'"It is going to explode next quarter." A friend whispers about a hot stock.',
      choices:[
        { text:'Invest big', sub:'Fortune favors the bold', moneyGamble:{ win:3, lose:0.3, chance:0.45 } },
        { text:'Invest a little', sub:'A calculated risk', moneyGamble:{ win:2, lose:0.6, chance:0.45 } },
        { text:'Pass entirely', sub:'Do not gamble what you cannot lose', effects:{ smarts:3 } },
      ]
    },
    {
      id:'adult_laid_off', title:'Laid Off', stage:'adult', weight:5,
      category:'career',
      desc:'The company announces sweeping layoffs. Your name is on the list.',
      choices: null,
      effects:{ happiness:-20, money:-2000 }, log:'You were laid off from your job.', fireSelf:true
    },
    {
      id:'adult_midlife_crisis', title:'Mid-Life Reckoning', stage:'adult', weight:5, minAge:38, maxAge:52,
      category:'adventure',
      desc:'A wave of existential dread washes over you. Is this really your life?',
      choices:[
        { text:'Buy a sports car', sub:'Classic move', effects:{ happiness:15, money:-30000 } },
        { text:'Start therapy', sub:'Healthy coping', effects:{ happiness:15, smarts:5, money:-3000 } },
        { text:'Pick up a new hobby', sub:'Creative outlet', effects:{ happiness:12, smarts:3 } },
      ]
    },
    {
      id:'adult_marriage_proposal', title:'Marriage Proposal', stage:'adult', weight:6, requiresPartner:true,
      category:'family',
      desc:'The moment arrives. Your partner gets down on one knee.',
      choices:[
        { text:'Say yes', sub:'Here comes the rest of your life', effects:{ happiness:25 }, marry:true },
        { text:'Not ready yet', sub:'Thoughtful but painful', effects:{ happiness:-5 } },
        { text:'Say no', sub:'Sometimes love is not enough', effects:{ happiness:-15 }, breakUp:true },
      ]
    },
    {
      id:'adult_baby', title:'Expecting', stage:'adult', weight:5, requiresPartner:true,
      category:'family',
      desc:'The test is positive. You are going to be a parent.',
      choices:[
        { text:'Celebrate', sub:'Embrace parenthood', effects:{ happiness:20, money:-5000 }, haveChild:true },
        { text:'Mixed feelings...', sub:'Ready or not', effects:{ happiness:8, money:-5000 }, haveChild:true },
      ]
    },
    {
      id:'adult_parent_sick', title:"Parent's Illness", stage:'adult', weight:5,
      category:'family',
      desc:'One of your parents is diagnosed with a serious illness. The call comes on a Tuesday.',
      choices:[
        { text:'Drop everything and go to them', sub:'Family first', effects:{ happiness:-10, money:-2000 } },
        { text:'Support them from afar', sub:'Do what you can', effects:{ happiness:-8 } },
      ]
    },
    {
      id:'adult_divorce', title:'Growing Apart', stage:'adult', weight:4, requiresPartner:true,
      category:'family',
      desc:'Your relationship has been strained for a while. The word divorce comes up.',
      choices:[
        { text:'Seek couples therapy', sub:'Fight for the relationship', effects:{ happiness:-5, money:-3000 } },
        { text:'File for divorce', sub:'Sometimes you have to let go', effects:{ happiness:-20, money:-15000 }, divorce:true },
      ]
    },
    {
      id:'adult_vacation', title:'Much-Needed Vacation', stage:'adult', weight:5,
      category:'adventure',
      desc:'You finally book that trip you have been dreaming about for years.',
      choices:[
        { text:'Somewhere exotic', sub:'Bali, Paris, Tokyo...', effects:{ happiness:20, money:-6000 } },
        { text:'Local camping trip', sub:'Back to nature', effects:{ happiness:14, money:-500 } },
      ]
    },
    {
      id:'adult_lottery', title:'Lottery Ticket', stage:'adult', weight:3,
      category:'adventure',
      desc:'You buy a lottery ticket on a whim. The numbers are announced...',
      choices: null,
      lottery:true, log:'You tried the lottery.'
    },
    {
      id:'adult_windfall', title:'Unexpected Windfall', stage:'adult', weight:3,
      category:'adventure',
      desc:'An inheritance, a bonus, or a settlement — unexpected money arrives.',
      choices: null,
      effects:{ money:15000, happiness:12 }, log:'You received an unexpected windfall of money.'
    },

    // ── SENIOR ────────────────────────────────────────────────────
    {
      id:'senior_retirement', title:'Retirement Day', stage:'senior', weight:8, once:true, minAge:60,
      category:'career',
      desc:'After decades of work, you hang up your badge for the last time.',
      choices:[
        { text:'Embrace the freedom', sub:'You have earned it', effects:{ happiness:25 }, retire:true },
        { text:'Keep working part-time', sub:'Cannot stop, will not stop', effects:{ happiness:10, money:10000 } },
      ]
    },
    {
      id:'senior_grandchild', title:'Grandparent', stage:'senior', weight:6,
      category:'family',
      desc:'Your child calls with the news: you are going to be a grandparent.',
      choices: null,
      effects:{ happiness:30 }, log:'You became a grandparent.'
    },
    {
      id:'senior_health_decline', title:'Slowing Down', stage:'senior', weight:7,
      category:'health',
      desc:'Your doctor recommends you take things easier.',
      choices:[
        { text:'Follow medical advice', sub:'Smart choice', effects:{ health:-5, money:-2000 } },
        { text:'Push through anyway', sub:'Stubborn but spirited', effects:{ health:-15, happiness:5 } },
      ]
    },
    {
      id:'senior_old_friend', title:'Old Friend Visits', stage:'senior', weight:5,
      category:'social',
      desc:'A friend you have not seen in 30 years shows up at your door.',
      choices: null,
      effects:{ happiness:20 }, log:'An old friend visited unexpectedly.'
    },
    {
      id:'senior_travel', title:'Dream Retirement Trip', stage:'senior', weight:5,
      category:'adventure',
      desc:'You and your loved ones take the trip you always promised yourselves.',
      choices:[
        { text:'World cruise', sub:'Go big', effects:{ happiness:25, money:-15000 } },
        { text:'Train across the country', sub:'See the homeland', effects:{ happiness:18, money:-4000 } },
        { text:'Stay home in comfort', sub:'Contentment is its own joy', effects:{ happiness:10 } },
      ]
    },
    {
      id:'senior_legacy', title:'Your Legacy', stage:'senior', weight:4,
      category:'adventure',
      desc:'You decide to do something meaningful with your remaining years.',
      choices:[
        { text:'Donate to a cause', sub:'Give back', effects:{ happiness:20, money:-5000 } },
        { text:'Write your memoirs', sub:'Leave a record', effects:{ happiness:15, smarts:5 } },
        { text:'Plant an orchard', sub:'Something that outlives you', effects:{ happiness:18 } },
      ]
    },
    {
      id:'senior_friend_passes', title:'A Friend Passes', stage:'senior', weight:5,
      category:'family',
      desc:'You receive news that an old friend has died. It makes you reflective.',
      choices: null,
      effects:{ happiness:-12 }, log:'You mourned the loss of an old friend.'
    },

    // ── IDENTITY & SOCIAL ─────────────────────────────────────────
    {
      id:'identity_question', title:'Who Am I?', stage:'teen', weight:5, once:true,
      category:'social',
      desc:"You find yourself questioning things you'd always assumed about yourself. It feels both scary and freeing.",
      choices:[
        { text:'Explore it privately', sub:'Journal and reflect', effects:{ happiness:3, smarts:5 } },
        { text:'Talk to a trusted friend', sub:'Vulnerability takes courage', effects:{ happiness:8 } },
        { text:'Brush it off for now', sub:'Not ready yet', effects:{ happiness:-3 } },
      ]
    },
    {
      id:'coming_out_decision', title:'Coming Out', stage:'teen', weight:4, once:true,
      isLgbt:true, // only fires if sexuality !== straight or genderIdentity !== cis
      category:'social',
      desc:"You have been holding something close to your chest for a while now. It feels like time.",
      choices:[
        { text:'Come out to your family', sub:'Nerve-wracking but true', effects:{ happiness:18 }, comingOut:'family' },
        { text:'Come out to your closest friends first', sub:'Safer ground', effects:{ happiness:15 }, comingOut:'friends' },
        { text:'Not yet — keep it to yourself', sub:'On your own timeline', effects:{ happiness:-5 } },
      ]
    },
    {
      id:'pride_event', title:'Pride Parade', stage:'any', weight:4, minAge:14,
      isLgbt:true,
      category:'social',
      desc:'There is a Pride parade in town this weekend.',
      choices:[
        { text:'March and celebrate', sub:'Joy in community', effects:{ happiness:20 } },
        { text:'Watch from the sidelines', sub:'Still meaningful', effects:{ happiness:10 } },
        { text:'Skip it', sub:'Not your thing right now', effects:{ } },
      ]
    },
    {
      id:'school_crush_12', title:'Your First Crush', stage:'teen', weight:7, once:true, minAge:12, maxAge:15,
      category:'social',
      desc:'There is someone at school you cannot stop thinking about. Your heart jumps every time they walk in.',
      choices:[
        { text:'Leave a note in their locker', sub:'Old school and sweet', effects:{ happiness:12 }, addCrush:true },
        { text:'Make excuses to sit near them', sub:'Subtle but hopeful', effects:{ happiness:8 }, addCrush:true },
        { text:'Keep it completely secret', sub:'Safe inside your head', effects:{ happiness:3 } },
      ]
    },
    {
      id:'first_relationship', title:'First Relationship', stage:'teen', weight:5, once:true, minAge:13,
      category:'social',
      desc:"Your crush asked you out — or maybe you finally worked up the nerve. Either way, you have got your first relationship.",
      choices:[
        { text:'Say yes — dive in!', sub:'First loves are forever in memory', effects:{ happiness:20 }, addPartner:true },
        { text:'Take it slow first', sub:'Get to know them better', effects:{ happiness:10 } },
      ]
    },
    {
      id:'lgbtq_friend', title:'A Friend Like You', stage:'teen', weight:5, once:true,
      isLgbt:true,
      category:'social',
      desc:'You meet someone at school who is going through similar things. A real, deep friendship starts here.',
      choices: null,
      effects:{ happiness:15 }, log:'You found a friend who truly understands you.', addFriend:true
    },
    {
      id:'self_expression_art', title:'Express Yourself', stage:'teen', weight:5,
      category:'social',
      desc:'You want to express who you are — through your clothes, hair, or art.',
      choices:[
        { text:'Go all in — bold look', sub:'Head-turning style', effects:{ happiness:15, looks:5 } },
        { text:'Subtle personal touches', sub:'Quietly you', effects:{ happiness:8, looks:2 } },
        { text:'Not ready for that', sub:'Another time', effects:{ } },
      ]
    },
    {
      id:'school_social_hangout', title:'After-School Hangout', stage:'child', weight:6,
      category:'social',
      desc:'Your classmates invite you to hang out after school. Ice cream and games at the park.',
      choices:[
        { text:'Join them!', sub:'Good times', effects:{ happiness:10 } },
        { text:'Head home and study', sub:'Dedicated', effects:{ smarts:5 } },
      ]
    },
    {
      id:'teen_group_hangout', title:'Weekend Plans', stage:'teen', weight:6,
      category:'social',
      desc:'Your friend group is getting together this weekend. Whose house will it be at?',
      choices:[
        { text:'Host at your place', sub:'Great host energy', effects:{ happiness:12 } },
        { text:'Suggest the park', sub:'Low key and fun', effects:{ happiness:8, health:3 } },
        { text:'Skip it this time', sub:'Introverted', effects:{ happiness:-3 } },
      ]
    },

    // ── SEASONAL EVENTS ──────────────────────────────────────────
    {
      id:'new_year_resolution', title:'New Year', stage:'any', weight:4, minAge:16,
      category:'social',
      desc:"The new year arrives. Everyone is buzzing with hope and fresh starts.",
      choices:[
        { text:'Set a big goal', sub:'Ambitious start', effects:{ happiness:8, smarts:3 } },
        { text:'Reflect quietly', sub:'Thoughtful energy', effects:{ happiness:5, mentalHealth:5 } },
        { text:'Ignore the fuss', sub:'Every day is the same', effects:{} },
      ]
    },
    {
      id:'holiday_season', title:'Holiday Season', stage:'any', weight:4,
      category:'family',
      desc:"The holidays are here — lights, food, family gatherings, and maybe a little chaos.",
      choices:[
        { text:'Host a big gathering', sub:'-$300, great bonding', effects:{ happiness:18, money:-300 } },
        { text:'Cozy night in', sub:'Simple and warm', effects:{ happiness:10, mentalHealth:6 } },
        { text:'Travel somewhere festive', sub:'-$500', effects:{ happiness:15, money:-500 } },
      ]
    },
    {
      id:'summer_plans', title:'Summer Arrives', stage:'any', weight:3, minAge:8,
      category:'adventure',
      desc:"Summer is here. Long days, warm nights, and endless possibility.",
      choices:[
        { text:'Make the most of it', sub:'Active summer', effects:{ happiness:12, health:5 } },
        { text:'Stay home and rest', sub:'Recovery mode', effects:{ happiness:6, health:8, mentalHealth:5 } },
        { text:'Pick up a new skill', sub:'Productive summer', effects:{ smarts:8, happiness:5 } },
      ]
    },
    {
      id:'birthday_reflection', title:'Another Year Older', stage:'any', weight:3, minAge:18,
      category:'social',
      desc:"Your birthday. You find yourself reflecting on where you are and where you are going.",
      choices:[
        { text:'Celebrate with everyone', sub:'Big party energy', effects:{ happiness:15 } },
        { text:'Intimate gathering', sub:'Quality over quantity', effects:{ happiness:10, mentalHealth:5 } },
        { text:'Treat yourself solo', sub:'Self-love', effects:{ happiness:8, mentalHealth:8 } },
      ]
    },

    // ── FINANCIAL CRISIS EVENTS ────────────────────────────────
    {
      id:'market_crash', title:'Market Crash', stage:'adult', weight:2,
      category:'career',
      desc:"The stock market collapses overnight. Financial headlines are terrifying.",
      choices:[
        { text:'Sell everything immediately', sub:'Salvage what you can', effects:{ happiness:-10 }, sellInvestments:true },
        { text:'Hold and wait it out', sub:'Risky long game', effects:{ happiness:-5 } },
        { text:'Buy more — the dip!', sub:'Bold contrarian move', effects:{ happiness:-3, money:-5000 }, buyDip:true },
      ]
    },
    {
      id:'recession_hits', title:'Economic Recession', stage:'adult', weight:2,
      category:'career',
      desc:"The economy enters recession. Layoffs are everywhere and costs are rising.",
      choices:[
        { text:'Cut all unnecessary spending', sub:'Survival mode', effects:{ happiness:-8 } },
        { text:'Look for extra work', sub:'Side hustle energy', effects:{ happiness:-5, money:2000 } },
        { text:'Keep living normally', sub:'Optimism (or denial)', effects:{ happiness:3, money:-3000 } },
      ]
    },

    // ── HEALTH CONDITION EVENTS ───────────────────────────────
    {
      id:'diagnosed_anxiety', title:'Anxiety Diagnosis', stage:'any', weight:3, once:true, minAge:14,
      category:'health',
      desc:"You have been feeling off for a while. A doctor diagnoses you with an anxiety disorder.",
      choices:[
        { text:'Start treatment right away', sub:'Therapy + medication', effects:{ mentalHealth:5, money:-500 } },
        { text:'Try lifestyle changes first', sub:'Exercise, diet, routines', effects:{ health:3 } },
        { text:'Ignore it for now', sub:'Denial', effects:{ mentalHealth:-8 } },
      ]
    },
    {
      id:'back_injury', title:'Back Injury', stage:'adult', weight:3, once:true,
      category:'health',
      desc:"You hurt your back badly. The doctor says it might be chronic.",
      choices:[
        { text:'Follow the treatment plan', sub:'Physical therapy', effects:{ health:-5, money:-1000 } },
        { text:'Push through it', sub:'Stubborn but risky', effects:{ health:-12 } },
      ]
    },

    // ── PARENT EVENTS ────────────────────────────────────────────
    {
      id:'parent_retirement_call', title:'Parent Retires', stage:'any', weight:5, once:true,
      requiresParent:true,
      category:'family',
      desc:"Your parent calls with big news — they've retired! They sound relieved.",
      choices:[
        { text:'Celebrate with them', sub:'Plan a dinner', effects:{ happiness:8 } },
        { text:'Send flowers', sub:'Sweet gesture', effects:{ happiness:5 } },
      ]
    },
    {
      id:'parent_sick', title:"Parent's Health Scare", stage:'any', weight:4,
      requiresParent:true,
      category:'family',
      desc:'Your parent is in the hospital. The doctors need to run more tests.',
      choices:[
        { text:'Go be with them', sub:'Drop everything', effects:{ happiness:-8, money:-1000 } },
        { text:'Call every day', sub:'Supportive from afar', effects:{ happiness:-5 } },
      ]
    },
    {
      id:'parent_needs_help', title:'Caring for a Parent', stage:'any', weight:4, minAge:30,
      requiresParent:true,
      category:'family',
      desc:'One of your parents is getting older and needs more help day-to-day.',
      choices:[
        { text:'Move them in with you', sub:'Big commitment', effects:{ happiness:-5, money:-5000 } },
        { text:'Hire a carer for them', sub:'-$2000/yr', effects:{ happiness:5, money:-2000 } },
        { text:'Visit more often', sub:'Emotional support', effects:{ happiness:3 } },
      ]
    },

    // ── CAREER-SPECIFIC ───────────────────────────────────────────
    {
      id:'career_doctor_save', title:'Code Blue', stage:'adult', weight:5,
      requiresJobCat:'medical',
      category:'career',
      desc:'A patient codes in the ER. You have seconds to act.',
      choices:[
        { text:'Jump in and save them', sub:'You have got this', effects:{ happiness:20, health:-5 } },
        { text:'Freeze for a moment', sub:'Human after all', effects:{ happiness:-5, health:-3 } },
      ]
    },
    {
      id:'career_lawyer_win', title:'Big Case Win', stage:'adult', weight:5,
      requiresJobCat:'legal', category:'career',
      desc:'You win a landmark case. The courtroom erupts.',
      choices: null,
      effects:{ happiness:20, money:8000 }, log:'You won a landmark court case.'
    },
    {
      id:'career_artist_gallery', title:'Gallery Show', stage:'any', weight:5,
      requiresJobCat:'artistic', category:'career',
      desc:'A prestigious gallery offers to display your work.',
      choices:[
        { text:'Submit your best pieces', sub:'This is your moment', effects:{ happiness:20, fame:15, money:3000 } },
        { text:'Decline — not ready yet', sub:'Perfectionism strikes', effects:{ happiness:-5 } },
      ]
    },
    {
      id:'career_musician_viral', title:'Viral Moment', stage:'any', weight:5,
      requiresJobCat:'artistic', category:'career',
      desc:'One of your songs blows up online overnight. Your phone will not stop.',
      choices: null,
      effects:{ happiness:25, fame:20, money:5000 }, log:'One of your songs went viral.'
    },
    {
      id:'career_actor_break', title:'Big Break', stage:'any', weight:4,
      requiresJobCat:'artistic', category:'career',
      desc:'A major director calls. They want you for a significant role.',
      choices:[
        { text:'Take the role', sub:'Lights, camera, action', effects:{ happiness:25, fame:20, money:15000 } },
        { text:'Negotiate terms first', sub:'Know your worth', effects:{ happiness:20, fame:15, money:20000 } },
      ]
    },
    {
      id:'career_engineer_headhunt', title:'Headhunted', stage:'adult', weight:5,
      requiresJobCat:'tech', category:'career',
      desc:'A recruiter slides into your inbox with a jaw-dropping offer.',
      choices:[
        { text:'Accept the offer', sub:'Big money, big tech', effects:{ happiness:15, money:20000 } },
        { text:'Use it to negotiate current job', sub:'Loyalty with leverage', effects:{ happiness:10, money:10000 } },
        { text:'Stay where you are', sub:'Stability over salary', effects:{ happiness:5 } },
      ]
    },
    {
      id:'career_teacher_thanks', title:'That Student', stage:'any', weight:6,
      requiresJobCat:'education', category:'career',
      desc:'A former student tracks you down to say you changed their life.',
      choices: null,
      effects:{ happiness:30 }, log:'A former student told you that you changed their life.'
    },
    {
      id:'career_artist_flop', title:'The Flop', stage:'any', weight:4,
      requiresJobCat:'artistic', category:'career',
      desc:'Your latest project gets a brutal reception. The critics are not kind.',
      choices:[
        { text:'Keep going anyway', sub:'True artists persist', effects:{ happiness:-8, smarts:5 } },
        { text:'Take a break', sub:'Recharge your spirit', effects:{ happiness:-3 } },
      ]
    },
    {
      id:'career_business_deal', title:'Deal Closes', stage:'adult', weight:5,
      requiresJobCat:'business', category:'career',
      desc:'After months of negotiations, you close the biggest deal of your career.',
      choices: null,
      effects:{ happiness:20, money:12000 }, log:'You closed the biggest deal of your career.'
    },
    {
      id:'career_malpractice', title:'Malpractice Suit', stage:'adult', weight:3,
      requiresJobCat:'medical', category:'career',
      desc:"A patient's family is threatening to sue you for malpractice.",
      choices:[
        { text:'Fight it in court', sub:'Prove your innocence', effects:{ happiness:-15, money:-20000 } },
        { text:'Settle out of court', sub:'Quick resolution', effects:{ happiness:-10, money:-35000 } },
      ]
    },
  ];

  // ── Careers ────────────────────────────────────────────────────
  const CAREERS = {
    // Entry Level
    cashier:        { id:'cashier', name:'Retail Cashier', icon:'RC', iconClass:'ic-orange', category:'entry', desc:'Handle transactions at a store.', requirements:{ minAge:16 }, salary:{ base:24000, max:38000 }, promotions:[{title:'Cashier',salaryMult:1.0,yearsMin:0},{title:'Senior Cashier',salaryMult:1.2,yearsMin:2},{title:'Shift Supervisor',salaryMult:1.5,yearsMin:4},{title:'Store Manager',salaryMult:2.0,yearsMin:8}] },
    barista:        { id:'barista', name:'Barista', icon:'Ba', iconClass:'ic-amber', category:'entry', desc:'Craft coffee and chat with regulars.', requirements:{ minAge:16 }, salary:{ base:22000, max:36000 }, promotions:[{title:'Barista',salaryMult:1.0,yearsMin:0},{title:'Lead Barista',salaryMult:1.3,yearsMin:2},{title:'Cafe Manager',salaryMult:1.8,yearsMin:5}] },
    fast_food:      { id:'fast_food', name:'Fast Food Worker', icon:'FF', iconClass:'ic-amber', category:'entry', desc:'Keep the drive-through moving.', requirements:{ minAge:16 }, salary:{ base:21000, max:30000 }, promotions:[{title:'Crew Member',salaryMult:1.0,yearsMin:0},{title:'Crew Lead',salaryMult:1.2,yearsMin:2},{title:'Shift Manager',salaryMult:1.5,yearsMin:4}] },
    delivery_driver:{ id:'delivery_driver', name:'Delivery Driver', icon:'DD', iconClass:'ic-orange', category:'entry', desc:'Deliver packages and food.', requirements:{ minAge:18 }, salary:{ base:28000, max:45000 }, promotions:[{title:'Driver',salaryMult:1.0,yearsMin:0},{title:'Senior Driver',salaryMult:1.3,yearsMin:3},{title:'Route Supervisor',salaryMult:1.6,yearsMin:6}] },
    warehouse_worker:{ id:'warehouse_worker', name:'Warehouse Worker', icon:'WW', iconClass:'ic-orange', category:'entry', desc:'Organize inventory in a warehouse.', requirements:{ minAge:18 }, salary:{ base:30000, max:48000 }, promotions:[{title:'Associate',salaryMult:1.0,yearsMin:0},{title:'Senior Associate',salaryMult:1.2,yearsMin:2},{title:'Team Lead',salaryMult:1.5,yearsMin:5},{title:'Warehouse Manager',salaryMult:2.0,yearsMin:9}] },
    telemarketer:   { id:'telemarketer', name:'Telemarketer', icon:'TM', iconClass:'ic-orange', category:'entry', desc:'Make cold calls and sell products.', requirements:{ minAge:18, minSmarts:20 }, salary:{ base:25000, max:50000 }, promotions:[{title:'Agent',salaryMult:1.0,yearsMin:0},{title:'Senior Agent',salaryMult:1.4,yearsMin:2},{title:'Team Leader',salaryMult:1.8,yearsMin:5}] },
    receptionist:   { id:'receptionist', name:'Receptionist', icon:'Re', iconClass:'ic-orange', category:'entry', desc:'Greet guests, manage the office.', requirements:{ minAge:18, minSmarts:25 }, salary:{ base:28000, max:44000 }, promotions:[{title:'Receptionist',salaryMult:1.0,yearsMin:0},{title:'Office Administrator',salaryMult:1.4,yearsMin:3},{title:'Office Manager',salaryMult:1.8,yearsMin:7}] },

    // Trade
    electrician:    { id:'electrician', name:'Electrician', icon:'El', iconClass:'ic-amber', category:'trade', desc:'Wire buildings and fix electrical systems.', requirements:{ minAge:18, education:'tradeschool', certificate:'electrical', minSmarts:35 }, salary:{ base:52000, max:95000 }, promotions:[{title:'Apprentice',salaryMult:1.0,yearsMin:0},{title:'Journeyman',salaryMult:1.4,yearsMin:3},{title:'Master Electrician',salaryMult:1.8,yearsMin:7},{title:'Contractor',salaryMult:2.5,yearsMin:12}] },
    plumber:        { id:'plumber', name:'Plumber', icon:'Pl', iconClass:'ic-blue', category:'trade', desc:'Fix pipes and plumbing systems.', requirements:{ minAge:18, education:'tradeschool', certificate:'plumbing', minSmarts:30 }, salary:{ base:50000, max:90000 }, promotions:[{title:'Apprentice',salaryMult:1.0,yearsMin:0},{title:'Journeyman',salaryMult:1.4,yearsMin:3},{title:'Master Plumber',salaryMult:1.8,yearsMin:7},{title:'Contractor',salaryMult:2.4,yearsMin:12}] },
    mechanic:       { id:'mechanic', name:'Auto Mechanic', icon:'Me', iconClass:'ic-orange', category:'trade', desc:'Diagnose and fix vehicles.', requirements:{ minAge:18, education:'tradeschool', certificate:'automotive', minSmarts:30 }, salary:{ base:42000, max:80000 }, promotions:[{title:'Apprentice',salaryMult:1.0,yearsMin:0},{title:'Mechanic',salaryMult:1.3,yearsMin:2},{title:'Senior Mechanic',salaryMult:1.6,yearsMin:6},{title:'Shop Owner',salaryMult:2.2,yearsMin:11}] },
    chef:           { id:'chef', name:'Chef', icon:'Ch', iconClass:'ic-amber', category:'trade', desc:'Create culinary experiences from scratch.', requirements:{ minAge:18, education:'tradeschool', certificate:'culinary', minSmarts:25 }, salary:{ base:38000, max:85000 }, promotions:[{title:'Line Cook',salaryMult:1.0,yearsMin:0},{title:'Sous Chef',salaryMult:1.4,yearsMin:3},{title:'Head Chef',salaryMult:2.0,yearsMin:7},{title:'Executive Chef',salaryMult:2.8,yearsMin:12}] },
    paramedic:      { id:'paramedic', name:'Paramedic', icon:'Pa', iconClass:'ic-green', category:'trade', desc:'Respond to emergencies on the road.', requirements:{ minAge:18, education:'tradeschool', certificate:'paramedic', minSmarts:40 }, salary:{ base:46000, max:75000 }, promotions:[{title:'EMT',salaryMult:1.0,yearsMin:0},{title:'Paramedic',salaryMult:1.3,yearsMin:2},{title:'Senior Paramedic',salaryMult:1.6,yearsMin:6},{title:'Supervisor',salaryMult:2.0,yearsMin:11}] },
    hairdresser:    { id:'hairdresser', name:'Hair Stylist', icon:'HS', iconClass:'ic-rose', category:'trade', desc:'Cut, color, and style hair.', requirements:{ minAge:18, education:'tradeschool', certificate:'cosmetology', minLooks:30 }, salary:{ base:30000, max:70000 }, promotions:[{title:'Apprentice',salaryMult:1.0,yearsMin:0},{title:'Stylist',salaryMult:1.4,yearsMin:2},{title:'Senior Stylist',salaryMult:1.8,yearsMin:5},{title:'Salon Owner',salaryMult:2.5,yearsMin:10}] },
    truck_driver:   { id:'truck_driver', name:'Truck Driver', icon:'Tr', iconClass:'ic-orange', category:'trade', desc:'Haul freight across long distances.', requirements:{ minAge:21, education:'tradeschool', certificate:'cdl' }, salary:{ base:48000, max:85000 }, promotions:[{title:'Driver',salaryMult:1.0,yearsMin:0},{title:'Senior Driver',salaryMult:1.3,yearsMin:3},{title:'Owner-Operator',salaryMult:2.0,yearsMin:8}] },
    carpenter:      { id:'carpenter', name:'Carpenter', icon:'Ca', iconClass:'ic-amber', category:'trade', desc:'Build and repair structures in wood.', requirements:{ minAge:18, education:'tradeschool', certificate:'carpentry' }, salary:{ base:44000, max:78000 }, promotions:[{title:'Apprentice',salaryMult:1.0,yearsMin:0},{title:'Carpenter',salaryMult:1.3,yearsMin:3},{title:'Master Carpenter',salaryMult:1.7,yearsMin:8},{title:'Contractor',salaryMult:2.3,yearsMin:13}] },

    // Professional
    accountant:     { id:'accountant', name:'Accountant', icon:'Ac', iconClass:'ic-blue', category:'business', desc:'Manage financial records and taxes.', requirements:{ minAge:22, education:'bachelor', degree:['Accounting','Finance','Business'], minSmarts:50 }, salary:{ base:58000, max:130000 }, promotions:[{title:'Junior Accountant',salaryMult:1.0,yearsMin:0},{title:'Accountant',salaryMult:1.3,yearsMin:3},{title:'Senior Accountant',salaryMult:1.7,yearsMin:7},{title:'Accounting Manager',salaryMult:2.2,yearsMin:12},{title:'CFO',salaryMult:3.5,yearsMin:18}] },
    financial_analyst:{ id:'financial_analyst', name:'Financial Analyst', icon:'FA', iconClass:'ic-blue', category:'business', desc:'Analyze markets and guide investments.', requirements:{ minAge:22, education:'bachelor', degree:['Finance','Economics','Business'], minSmarts:55 }, salary:{ base:65000, max:160000 }, promotions:[{title:'Analyst',salaryMult:1.0,yearsMin:0},{title:'Senior Analyst',salaryMult:1.4,yearsMin:3},{title:'Portfolio Manager',salaryMult:2.0,yearsMin:7},{title:'VP of Finance',salaryMult:2.8,yearsMin:12},{title:'Chief Investment Officer',salaryMult:4.0,yearsMin:18}] },
    real_estate_agent:{ id:'real_estate_agent', name:'Real Estate Agent', icon:'RE', iconClass:'ic-teal', category:'business', desc:'Help people buy and sell homes.', requirements:{ minAge:20, certificate:'real_estate', minLooks:35, minSmarts:35 }, salary:{ base:35000, max:200000 }, promotions:[{title:'Agent',salaryMult:1.0,yearsMin:0},{title:'Senior Agent',salaryMult:1.5,yearsMin:3},{title:'Broker',salaryMult:2.0,yearsMin:7},{title:'Broker-Owner',salaryMult:3.5,yearsMin:12}] },
    engineer:       { id:'engineer', name:'Engineer', icon:'En', iconClass:'ic-blue', category:'tech', desc:'Design and build systems and software.', requirements:{ minAge:22, education:'bachelor', degree:['Engineering','Computer Science'], minSmarts:60 }, salary:{ base:75000, max:180000 }, promotions:[{title:'Junior Engineer',salaryMult:1.0,yearsMin:0},{title:'Engineer',salaryMult:1.3,yearsMin:3},{title:'Senior Engineer',salaryMult:1.7,yearsMin:6},{title:'Principal Engineer',salaryMult:2.2,yearsMin:11},{title:'Engineering Director',salaryMult:3.0,yearsMin:16}] },
    doctor:         { id:'doctor', name:'Doctor', icon:'Dr', iconClass:'ic-green', category:'medical', desc:'Diagnose and treat patients.', requirements:{ minAge:26, education:'doctorate', degree:['Medicine'], minSmarts:75 }, salary:{ base:130000, max:450000 }, promotions:[{title:'Resident',salaryMult:1.0,yearsMin:0},{title:'Attending Physician',salaryMult:1.8,yearsMin:4},{title:'Senior Physician',salaryMult:2.3,yearsMin:10},{title:'Chief of Medicine',salaryMult:3.2,yearsMin:18}] },
    nurse:          { id:'nurse', name:'Nurse', icon:'Nu', iconClass:'ic-green', category:'medical', desc:'Provide direct patient care.', requirements:{ minAge:22, education:'bachelor', degree:['Nursing'], minSmarts:50 }, salary:{ base:62000, max:110000 }, promotions:[{title:'Registered Nurse',salaryMult:1.0,yearsMin:0},{title:'Senior Nurse',salaryMult:1.3,yearsMin:4},{title:'Charge Nurse',salaryMult:1.6,yearsMin:8},{title:'Nurse Manager',salaryMult:2.0,yearsMin:13}] },
    lawyer:         { id:'lawyer', name:'Lawyer', icon:'La', iconClass:'ic-purple', category:'legal', desc:'Represent clients in legal matters.', requirements:{ minAge:25, education:'doctorate', degree:['Law'], minSmarts:70 }, salary:{ base:85000, max:400000 }, promotions:[{title:'Associate Attorney',salaryMult:1.0,yearsMin:0},{title:'Attorney',salaryMult:1.4,yearsMin:3},{title:'Senior Attorney',salaryMult:1.9,yearsMin:7},{title:'Partner',salaryMult:3.0,yearsMin:13},{title:'Judge',salaryMult:2.5,yearsMin:20}] },
    teacher:        { id:'teacher', name:'Teacher', icon:'Te', iconClass:'ic-green', category:'education', desc:'Educate children in school.', requirements:{ minAge:22, education:'bachelor', degree:['Education'], minSmarts:45 }, salary:{ base:42000, max:80000 }, promotions:[{title:'Junior Teacher',salaryMult:1.0,yearsMin:0},{title:'Teacher',salaryMult:1.2,yearsMin:3},{title:'Senior Teacher',salaryMult:1.4,yearsMin:8},{title:'Department Head',salaryMult:1.7,yearsMin:13},{title:'Principal',salaryMult:2.2,yearsMin:18}] },
    professor:      { id:'professor', name:'University Professor', icon:'Pr', iconClass:'ic-blue', category:'education', desc:'Teach and research at university level.', requirements:{ minAge:28, education:'doctorate', degree:['Any'], minSmarts:75 }, salary:{ base:70000, max:160000 }, promotions:[{title:'Lecturer',salaryMult:1.0,yearsMin:0},{title:'Assistant Professor',salaryMult:1.3,yearsMin:4},{title:'Associate Professor',salaryMult:1.6,yearsMin:8},{title:'Full Professor',salaryMult:2.1,yearsMin:14},{title:'Department Chair',salaryMult:2.6,yearsMin:20}] },
    police_officer: { id:'police_officer', name:'Police Officer', icon:'PO', iconClass:'ic-blue', category:'professional', desc:'Enforce laws and protect the community.', requirements:{ minAge:21, education:'highschool', minSmarts:40, minHealth:50 }, salary:{ base:52000, max:95000 }, promotions:[{title:'Officer',salaryMult:1.0,yearsMin:0},{title:'Corporal',salaryMult:1.2,yearsMin:3},{title:'Sergeant',salaryMult:1.5,yearsMin:7},{title:'Lieutenant',salaryMult:1.9,yearsMin:13},{title:'Captain',salaryMult:2.4,yearsMin:19},{title:'Chief',salaryMult:3.0,yearsMin:25}] },
    corporate_manager:{ id:'corporate_manager', name:'Corporate Manager', icon:'CM', iconClass:'ic-blue', category:'business', desc:'Lead teams in a large organization.', requirements:{ minAge:24, education:'bachelor', degree:['Business','Management','Any'], minSmarts:50 }, salary:{ base:70000, max:250000 }, promotions:[{title:'Coordinator',salaryMult:1.0,yearsMin:0},{title:'Manager',salaryMult:1.4,yearsMin:3},{title:'Senior Manager',salaryMult:1.9,yearsMin:7},{title:'Director',salaryMult:2.5,yearsMin:12},{title:'VP',salaryMult:3.5,yearsMin:17},{title:'CEO',salaryMult:5.0,yearsMin:23}] },
    pharmacist:     { id:'pharmacist', name:'Pharmacist', icon:'Ph', iconClass:'ic-green', category:'medical', desc:'Dispense medications and counsel patients.', requirements:{ minAge:24, education:'doctorate', degree:['Pharmacy'], minSmarts:65 }, salary:{ base:110000, max:160000 }, promotions:[{title:'Staff Pharmacist',salaryMult:1.0,yearsMin:0},{title:'Senior Pharmacist',salaryMult:1.3,yearsMin:5},{title:'Pharmacy Manager',salaryMult:1.6,yearsMin:10},{title:'Director of Pharmacy',salaryMult:2.0,yearsMin:16}] },
    architect:      { id:'architect', name:'Architect', icon:'Ar', iconClass:'ic-teal', category:'professional', desc:'Design beautiful and functional buildings.', requirements:{ minAge:24, education:'bachelor', degree:['Architecture'], minSmarts:60, minLooks:30 }, salary:{ base:65000, max:150000 }, promotions:[{title:'Draftsman',salaryMult:1.0,yearsMin:0},{title:'Architect',salaryMult:1.4,yearsMin:4},{title:'Senior Architect',salaryMult:1.8,yearsMin:9},{title:'Principal Architect',salaryMult:2.4,yearsMin:15}] },
    hr_manager:     { id:'hr_manager', name:'HR Manager', icon:'HR', iconClass:'ic-rose', category:'business', desc:'Recruit, develop, and retain talent.', requirements:{ minAge:22, education:'bachelor', degree:['Human Resources','Psychology','Business'], minSmarts:45 }, salary:{ base:55000, max:120000 }, promotions:[{title:'HR Coordinator',salaryMult:1.0,yearsMin:0},{title:'HR Generalist',salaryMult:1.3,yearsMin:3},{title:'HR Manager',salaryMult:1.7,yearsMin:7},{title:'HR Director',salaryMult:2.2,yearsMin:13},{title:'CHRO',salaryMult:3.0,yearsMin:19}] },
    dentist:        { id:'dentist', name:'Dentist', icon:'De', iconClass:'ic-green', category:'medical', desc:'Maintain oral health and perform procedures.', requirements:{ minAge:26, education:'doctorate', degree:['Dentistry'], minSmarts:65 }, salary:{ base:120000, max:280000 }, promotions:[{title:'Associate Dentist',salaryMult:1.0,yearsMin:0},{title:'Dentist',salaryMult:1.5,yearsMin:4},{title:'Senior Dentist',salaryMult:2.0,yearsMin:10},{title:'Practice Owner',salaryMult:2.8,yearsMin:16}] },

    // Artistic
    visual_artist:  { id:'visual_artist', name:'Visual Artist', icon:'VA', iconClass:'ic-rose', category:'artistic', desc:'Create paintings, sculptures, and mixed-media work.', requirements:{ minAge:18, minSmarts:30 }, salary:{ base:8000, max:500000 }, promotions:[{title:'Emerging Artist',salaryMult:1.0,yearsMin:0},{title:'Represented Artist',salaryMult:3.0,yearsMin:4},{title:'Established Artist',salaryMult:8.0,yearsMin:9},{title:'Renowned Artist',salaryMult:20.0,yearsMin:15}] },
    graphic_designer:{ id:'graphic_designer', name:'Graphic Designer', icon:'GD', iconClass:'ic-rose', category:'artistic', desc:'Design visual content for brands and media.', requirements:{ minAge:20, minSmarts:40 }, salary:{ base:40000, max:130000 }, promotions:[{title:'Junior Designer',salaryMult:1.0,yearsMin:0},{title:'Designer',salaryMult:1.4,yearsMin:3},{title:'Senior Designer',salaryMult:1.9,yearsMin:7},{title:'Creative Director',salaryMult:2.8,yearsMin:12}] },
    musician:       { id:'musician', name:'Musician', icon:'Mu', iconClass:'ic-purple', category:'artistic', desc:'Compose and perform music.', requirements:{ minAge:16, minSmarts:20 }, salary:{ base:5000, max:10000000 }, promotions:[{title:'Local Performer',salaryMult:1.0,yearsMin:0},{title:'Regional Act',salaryMult:3.0,yearsMin:3},{title:'Signed Artist',salaryMult:10.0,yearsMin:6},{title:'Chart-Topper',salaryMult:40.0,yearsMin:10},{title:'Legendary Musician',salaryMult:150.0,yearsMin:18}] },
    music_producer: { id:'music_producer', name:'Music Producer', icon:'MP', iconClass:'ic-purple', category:'artistic', desc:'Craft sounds and produce albums.', requirements:{ minAge:18, minSmarts:45 }, salary:{ base:15000, max:2000000 }, promotions:[{title:'Bedroom Producer',salaryMult:1.0,yearsMin:0},{title:'Studio Producer',salaryMult:3.0,yearsMin:3},{title:'Sought-After Producer',salaryMult:8.0,yearsMin:8},{title:'Legendary Producer',salaryMult:25.0,yearsMin:15}] },
    actor:          { id:'actor', name:'Actor', icon:'Ac', iconClass:'ic-amber', category:'artistic', desc:'Bring characters to life on stage and screen.', requirements:{ minAge:18, minLooks:40, minSmarts:30 }, salary:{ base:6000, max:20000000 }, promotions:[{title:'Background Extra',salaryMult:1.0,yearsMin:0},{title:'Supporting Actor',salaryMult:5.0,yearsMin:3},{title:'Lead Actor',salaryMult:20.0,yearsMin:7},{title:'A-List Celebrity',salaryMult:80.0,yearsMin:13},{title:'Hollywood Legend',salaryMult:200.0,yearsMin:22}] },
    comedian:       { id:'comedian', name:'Comedian', icon:'Co', iconClass:'ic-amber', category:'artistic', desc:'Make people laugh for a living.', requirements:{ minAge:18, minSmarts:40 }, salary:{ base:8000, max:5000000 }, promotions:[{title:'Open Mic Comic',salaryMult:1.0,yearsMin:0},{title:'Club Comic',salaryMult:3.0,yearsMin:3},{title:'Headliner',salaryMult:10.0,yearsMin:8},{title:'Comedy Star',salaryMult:40.0,yearsMin:15}] },
    novelist:       { id:'novelist', name:'Novelist', icon:'No', iconClass:'ic-blue', category:'artistic', desc:'Write fiction and hope people buy it.', requirements:{ minAge:18, minSmarts:50 }, salary:{ base:5000, max:3000000 }, promotions:[{title:'Aspiring Writer',salaryMult:1.0,yearsMin:0},{title:'Published Author',salaryMult:4.0,yearsMin:3},{title:'Bestselling Author',salaryMult:15.0,yearsMin:8},{title:'Literary Icon',salaryMult:50.0,yearsMin:18}] },
    journalist:     { id:'journalist', name:'Journalist', icon:'Jo', iconClass:'ic-teal', category:'artistic', desc:'Investigate and report the news.', requirements:{ minAge:22, education:'bachelor', degree:['Journalism','Communications'], minSmarts:55 }, salary:{ base:38000, max:140000 }, promotions:[{title:'Staff Reporter',salaryMult:1.0,yearsMin:0},{title:'Senior Reporter',salaryMult:1.4,yearsMin:4},{title:'Editor',salaryMult:1.9,yearsMin:9},{title:'Editor-in-Chief',salaryMult:2.8,yearsMin:16}] },
    photographer:   { id:'photographer', name:'Photographer', icon:'Ph', iconClass:'ic-teal', category:'artistic', desc:'Capture moments and sell images.', requirements:{ minAge:18, minLooks:25 }, salary:{ base:20000, max:250000 }, promotions:[{title:'Freelance',salaryMult:1.0,yearsMin:0},{title:'Professional',salaryMult:2.0,yearsMin:3},{title:'Sought-After',salaryMult:4.0,yearsMin:8},{title:'Iconic Photographer',salaryMult:10.0,yearsMin:15}] },
    content_creator:{ id:'content_creator', name:'Content Creator', icon:'CC', iconClass:'ic-rose', category:'artistic', desc:'Build an audience online.', requirements:{ minAge:16, minLooks:30, minSmarts:30 }, salary:{ base:3000, max:5000000 }, promotions:[{title:'Micro Creator',salaryMult:1.0,yearsMin:0},{title:'Mid-Tier Creator',salaryMult:5.0,yearsMin:2},{title:'Influencer',salaryMult:15.0,yearsMin:5},{title:'Mega Influencer',salaryMult:60.0,yearsMin:10},{title:'Internet Icon',salaryMult:200.0,yearsMin:16}] },
    game_designer:  { id:'game_designer', name:'Game Designer', icon:'GD', iconClass:'ic-purple', category:'artistic', desc:'Design games people love.', requirements:{ minAge:22, education:'bachelor', degree:['Computer Science','Game Design','Engineering'], minSmarts:60 }, salary:{ base:60000, max:250000 }, promotions:[{title:'Junior Designer',salaryMult:1.0,yearsMin:0},{title:'Designer',salaryMult:1.4,yearsMin:3},{title:'Senior Designer',salaryMult:1.9,yearsMin:7},{title:'Lead Designer',salaryMult:2.5,yearsMin:12},{title:'Creative Director',salaryMult:3.5,yearsMin:18}] },
    filmmaker:      { id:'filmmaker', name:'Filmmaker', icon:'Fi', iconClass:'ic-orange', category:'artistic', desc:'Write, direct, and produce films.', requirements:{ minAge:20, minSmarts:45 }, salary:{ base:10000, max:10000000 }, promotions:[{title:'Student Filmmaker',salaryMult:1.0,yearsMin:0},{title:'Indie Director',salaryMult:4.0,yearsMin:4},{title:'Festival Darling',salaryMult:12.0,yearsMin:9},{title:'Hollywood Director',salaryMult:40.0,yearsMin:16}] },
    fashion_designer:{ id:'fashion_designer', name:'Fashion Designer', icon:'FD', iconClass:'ic-rose', category:'artistic', desc:'Create clothing people wear.', requirements:{ minAge:20, minLooks:45, minSmarts:35 }, salary:{ base:28000, max:2000000 }, promotions:[{title:'Assistant Designer',salaryMult:1.0,yearsMin:0},{title:'Designer',salaryMult:1.8,yearsMin:3},{title:'Senior Designer',salaryMult:3.0,yearsMin:7},{title:'Fashion Icon',salaryMult:10.0,yearsMin:14}] },
    tattoo_artist:  { id:'tattoo_artist', name:'Tattoo Artist', icon:'TA', iconClass:'ic-orange', category:'artistic', desc:'Permanently ink art on willing humans.', requirements:{ minAge:18, minSmarts:30, minLooks:20 }, salary:{ base:30000, max:200000 }, promotions:[{title:'Apprentice',salaryMult:1.0,yearsMin:0},{title:'Tattoo Artist',salaryMult:1.6,yearsMin:2},{title:'Senior Artist',salaryMult:2.5,yearsMin:6},{title:'Renowned Artist',salaryMult:4.5,yearsMin:12}] },
    dancer:         { id:'dancer', name:'Dancer', icon:'Da', iconClass:'ic-rose', category:'artistic', desc:'Perform dance on stage, screen, or online.', requirements:{ minAge:16, minLooks:45, minHealth:50 }, salary:{ base:15000, max:1000000 }, promotions:[{title:'Student Dancer',salaryMult:1.0,yearsMin:0},{title:'Performing Dancer',salaryMult:2.0,yearsMin:2},{title:'Principal Dancer',salaryMult:4.0,yearsMin:6},{title:'Dance Star',salaryMult:12.0,yearsMin:12}] },

    // Sports
    footballer:        { id:'footballer',        name:'Footballer',        icon:'⚽', iconClass:'ic-green',  category:'sports', sportKey:'football',   desc:'Play professional football.',            requirements:{ minAge:16, minHealth:60 }, salary:{ base:30000,  max:20000000 }, promotions:[{title:'Youth Player',salaryMult:1.0,yearsMin:0},{title:'Reserve',salaryMult:2.5,yearsMin:2},{title:'First Team',salaryMult:6.0,yearsMin:4},{title:'Star Player',salaryMult:18.0,yearsMin:7},{title:'Club Legend',salaryMult:60.0,yearsMin:12}] },
    tennis_player:     { id:'tennis_player',     name:'Tennis Player',     icon:'🎾', iconClass:'ic-teal',   category:'sports', sportKey:'tennis',     desc:'Compete on the pro tennis circuit.',      requirements:{ minAge:16, minHealth:55 }, salary:{ base:20000,  max:15000000 }, promotions:[{title:'Tour Qualifier',salaryMult:1.0,yearsMin:0},{title:'Challenger',salaryMult:2.0,yearsMin:2},{title:'Top 50',salaryMult:5.0,yearsMin:4},{title:'Top 10',salaryMult:15.0,yearsMin:7},{title:'Grand Slam Champion',salaryMult:60.0,yearsMin:12}] },
    basketball_player: { id:'basketball_player', name:'Basketball Player', icon:'🏀', iconClass:'ic-amber',  category:'sports', sportKey:'basketball', desc:'Play pro basketball.',                    requirements:{ minAge:18, minHealth:65 }, salary:{ base:60000,  max:30000000 }, promotions:[{title:'G-League',salaryMult:1.0,yearsMin:0},{title:'Bench Player',salaryMult:3.0,yearsMin:2},{title:'Starter',salaryMult:8.0,yearsMin:4},{title:'All-Star',salaryMult:22.0,yearsMin:7},{title:'Hall of Famer',salaryMult:80.0,yearsMin:14}] },
    swimmer:           { id:'swimmer',           name:'Swimmer',           icon:'🏊', iconClass:'ic-teal',   category:'sports', sportKey:'swimming',   desc:'Compete in elite swimming.',             requirements:{ minAge:14, minHealth:60 }, salary:{ base:15000,  max:2000000  }, promotions:[{title:'Club Swimmer',salaryMult:1.0,yearsMin:0},{title:'National Qualifier',salaryMult:2.0,yearsMin:2},{title:'National Team',salaryMult:4.0,yearsMin:4},{title:'World Class',salaryMult:10.0,yearsMin:7},{title:'Olympic Legend',salaryMult:30.0,yearsMin:12}] },
    boxer:             { id:'boxer',             name:'Boxer',             icon:'🥊', iconClass:'ic-rose',   category:'sports', sportKey:'boxing',     desc:'Fight your way to the top.',             requirements:{ minAge:18, minHealth:65 }, salary:{ base:10000,  max:10000000 }, promotions:[{title:'Amateur',salaryMult:1.0,yearsMin:0},{title:'Pro Fighter',salaryMult:3.0,yearsMin:2},{title:'Contender',salaryMult:10.0,yearsMin:4},{title:'Champion',salaryMult:30.0,yearsMin:7},{title:'Legend',salaryMult:100.0,yearsMin:12}] },
  };

  const UNIVERSITY_MAJORS = [
    'Accounting','Architecture','Biology','Business','Chemistry','Communications',
    'Computer Science','Criminology','Economics','Education','Engineering',
    'English Literature','Finance','Game Design','History','Human Resources',
    'Journalism','Law','Management','Marketing','Mathematics','Medicine',
    'Music','Nursing','Pharmacy','Philosophy','Physics','Psychology','Social Work',
  ];

  const TRADE_CERTIFICATES = [
    { id:'electrical',  name:'Electrical Certificate',  icon:'El', cost:8000,  duration:2 },
    { id:'plumbing',    name:'Plumbing Certificate',    icon:'Pl', cost:7000,  duration:2 },
    { id:'automotive',  name:'Automotive Certificate',  icon:'Au', cost:7500,  duration:2 },
    { id:'culinary',    name:'Culinary Arts Certificate',icon:'Cu', cost:9000,  duration:2 },
    { id:'paramedic',   name:'Paramedic Certificate',   icon:'Pa', cost:10000, duration:2 },
    { id:'cosmetology', name:'Cosmetology Certificate', icon:'Co', cost:6000,  duration:1 },
    { id:'cdl',         name:"Commercial Driver's License",icon:'CD',cost:5000, duration:1 },
    { id:'carpentry',   name:'Carpentry Certificate',   icon:'Ca', cost:7000,  duration:2 },
    { id:'real_estate', name:'Real Estate License',     icon:'RE', cost:4000,  duration:1 },
  ];

  // ── Items / Objects shop ───────────────────────────────────────
  // hobbyBoost: hobby id whose practice gains +40% when item owned
  // statBoost: immediate one-time stat gain on purchase (books/consumables)
  // consumable: true = used once, removed from inventory
  const ITEMS = [
    // ── Instruments & Equipment ────────────────────────────────
    { id:'guitar',        name:'Guitar',              icon:'Gt', iconClass:'ic-purple', cost:300,   category:'equipment', desc:'Strum your way to music mastery.', hobbyBoost:'music',        statBoost:{} },
    { id:'keyboard',      name:'Keyboard / Piano',    icon:'Kp', iconClass:'ic-purple', cost:600,   category:'equipment', desc:'Keys unlock new musical horizons.', hobbyBoost:'music',        statBoost:{} },
    { id:'camera',        name:'Camera',              icon:'Cm', iconClass:'ic-teal',   cost:400,   category:'equipment', desc:'Capture moments beautifully.',      hobbyBoost:'photography',  statBoost:{} },
    { id:'video_camera',  name:'Video Camera',        icon:'Vc', iconClass:'ic-orange', cost:700,   category:'equipment', desc:'Start making your first films.',    hobbyBoost:'filmmaking',   statBoost:{} },
    { id:'art_supplies',  name:'Art Supplies',        icon:'As', iconClass:'ic-rose',   cost:120,   category:'equipment', desc:'Paints, brushes, and canvases.',   hobbyBoost:'drawing',      statBoost:{} },
    { id:'drawing_tablet',name:'Drawing Tablet',      icon:'Dt', iconClass:'ic-rose',   cost:350,   category:'equipment', desc:'Digital art at your fingertips.',  hobbyBoost:'drawing',      statBoost:{} },
    { id:'laptop',        name:'Laptop',              icon:'Lt', iconClass:'ic-blue',   cost:900,   category:'equipment', desc:'Code, create, and connect.',        hobbyBoost:'coding',       statBoost:{ smarts:3 } },
    { id:'dance_shoes',   name:'Dance Shoes',         icon:'Ds', iconClass:'ic-rose',   cost:160,   category:'equipment', desc:'The right shoes make all the difference.', hobbyBoost:'dance', statBoost:{} },
    { id:'yoga_mat',      name:'Yoga Mat & Props',    icon:'Ym', iconClass:'ic-teal',   cost:80,    category:'equipment', desc:'Set the scene for mindful practice.', hobbyBoost:'yoga',      statBoost:{} },
    { id:'running_shoes', name:'Running Shoes',       icon:'Rs', iconClass:'ic-green',  cost:120,   category:'equipment', desc:'Proper gear for serious athletes.', hobbyBoost:'sports',       statBoost:{ health:2 } },
    { id:'journal',       name:'Writer\'s Journal',   icon:'Jn', iconClass:'ic-blue',   cost:40,    category:'equipment', desc:'Pour your thoughts onto the page.', hobbyBoost:'writing',     statBoost:{} },
    { id:'fashion_set',   name:'Fashion Kit',         icon:'Fk', iconClass:'ic-rose',   cost:250,   category:'equipment', desc:'Fabrics, patterns, and a sewing machine.', hobbyBoost:'fashion', statBoost:{ looks:2 } },
    { id:'acting_course', name:'Acting Handbook',     icon:'Ak', iconClass:'ic-amber',  cost:90,    category:'equipment', desc:'Study the craft of performance.',  hobbyBoost:'theater',      statBoost:{} },
    // ── Books (consumable — one-time stat boost) ───────────────
    { id:'book_science',  name:'Science Textbook',    icon:'BS', iconClass:'ic-blue',   cost:30,    category:'book', desc:'+8 Smarts', hobbyBoost:null, statBoost:{ smarts:8 },              consumable:true },
    { id:'book_selfhelp', name:'Self-Help Book',      icon:'BH', iconClass:'ic-teal',   cost:18,    category:'book', desc:'+7 Happiness', hobbyBoost:null, statBoost:{ happiness:7 },        consumable:true },
    { id:'book_fitness',  name:'Fitness Guide',       icon:'BF', iconClass:'ic-green',  cost:22,    category:'book', desc:'+6 Health', hobbyBoost:null, statBoost:{ health:6 },               consumable:true },
    { id:'book_novel',    name:'Great Novel',         icon:'BN', iconClass:'ic-amber',  cost:14,    category:'book', desc:'+5 Smarts, +3 Happiness', hobbyBoost:null, statBoost:{ smarts:5, happiness:3 }, consumable:true },
    { id:'book_art',      name:'Art History Book',    icon:'BA', iconClass:'ic-rose',   cost:35,    category:'book', desc:'+6 Smarts (art focus)', hobbyBoost:'drawing', statBoost:{ smarts:6 }, consumable:true },
    { id:'book_business', name:'Business Strategy',  icon:'BB', iconClass:'ic-blue',   cost:45,    category:'book', desc:'+8 Smarts (career focus)', hobbyBoost:null, statBoost:{ smarts:8 }, consumable:true },
    { id:'book_poetry',   name:'Poetry Collection',  icon:'BP', iconClass:'ic-purple', cost:12,    category:'book', desc:'+4 Happiness, +3 Smarts', hobbyBoost:'writing', statBoost:{ happiness:4, smarts:3 }, consumable:true },
  ];

  function getItem(id) { return ITEMS.find(i => i.id === id) || null; }
  function getAllItems() { return ITEMS; }
  function getItemsByCategory(cat) { return ITEMS.filter(i => i.category === cat); }

  // ── Pets ────────────────────────────────────────────────────────
  const PETS = [
    { id:'dog',     name:'Dog',     icon:'Dg', iconClass:'ic-amber',  lifespan:12, happinessBonus:5, vetCost:300,  adoptCost:200,  desc:'Loyal, loving, and always happy to see you.'   },
    { id:'cat',     name:'Cat',     icon:'Ct', iconClass:'ic-orange', lifespan:15, happinessBonus:3, vetCost:200,  adoptCost:150,  desc:'Independent but endlessly charming.'            },
    { id:'rabbit',  name:'Rabbit',  icon:'Rb', iconClass:'ic-rose',   lifespan:8,  happinessBonus:3, vetCost:150,  adoptCost:80,   desc:'Fluffy and surprisingly social.'                },
    { id:'hamster', name:'Hamster', icon:'Hm', iconClass:'ic-amber',  lifespan:2,  happinessBonus:2, vetCost:80,   adoptCost:30,   desc:'Tiny, busy, and adorable.'                      },
    { id:'fish',    name:'Fish',    icon:'Fs', iconClass:'ic-teal',   lifespan:3,  happinessBonus:1, vetCost:30,   adoptCost:20,   desc:'Peaceful to watch, easy to care for.'           },
    { id:'turtle',  name:'Turtle',  icon:'Tu', iconClass:'ic-green',  lifespan:40, happinessBonus:2, vetCost:120,  adoptCost:100,  desc:'Slow, wise, and might outlive you.'             },
    { id:'parrot',  name:'Parrot',  icon:'Pr', iconClass:'ic-green',  lifespan:30, happinessBonus:4, vetCost:250,  adoptCost:400,  desc:'Talks back, sings, and steals your heart.'     },
  ];

  function getPet(id) { return PETS.find(p => p.id === id) || null; }

  // ── Travel Destinations ─────────────────────────────────────────
  const TRAVEL_DESTINATIONS = [
    { id:'europe',       name:'Europe',        icon:'EU', iconClass:'ic-blue',   cost:3000, effects:{ smarts:7,  happiness:10, mentalHealth:5  }, desc:'Museums, history, and café culture.'           },
    { id:'east_asia',    name:'East Asia',     icon:'EA', iconClass:'ic-teal',   cost:4000, effects:{ smarts:9,  happiness:8,  mentalHealth:6  }, desc:'Ancient traditions meet futuristic cities.'    },
    { id:'southeast_asia',name:'SE Asia',      icon:'SA', iconClass:'ic-green',  cost:3500, effects:{ happiness:14,health:4,   mentalHealth:8  }, desc:'Tropical paradise and rich culture.'           },
    { id:'americas',     name:'The Americas',  icon:'AM', iconClass:'ic-amber',  cost:2500, effects:{ happiness:10,health:6,   mentalHealth:5  }, desc:'Road trips, nature, and vibrant cities.'       },
    { id:'africa',       name:'Africa',        icon:'AF', iconClass:'ic-orange', cost:4500, effects:{ happiness:12,smarts:6,   mentalHealth:8  }, desc:'Wildlife, history, and breathtaking landscapes.'},
    { id:'middle_east',  name:'Middle East',   icon:'ME', iconClass:'ic-amber',  cost:3500, effects:{ smarts:8,  happiness:6,  mentalHealth:4  }, desc:'Ancient civilization and modern architecture.' },
    { id:'oceania',      name:'Oceania',       icon:'OC', iconClass:'ic-teal',   cost:5000, effects:{ health:9,  happiness:14, mentalHealth:10 }, desc:'Sun, surf, and natural wonders.'               },
  ];

  function getTravelDest(id) { return TRAVEL_DESTINATIONS.find(t => t.id === id) || null; }

  // ── Side Hustles ────────────────────────────────────────────────
  // incomeRange: [min, max] — scaled by hobby skill level
  const SIDE_HUSTLES = [
    { id:'busking',     name:'Street Busking',    icon:'Bu', iconClass:'ic-purple', hobbyReq:'music',       minSkill:15, minSmarts:0,  desc:'Play music in public for tips.',          incomeRange:[30,  400]  },
    { id:'sell_art',    name:'Sell Artwork',       icon:'Sa', iconClass:'ic-rose',   hobbyReq:'drawing',     minSkill:20, minSmarts:0,  desc:'Sell paintings, prints, and commissions.',incomeRange:[50,  900]  },
    { id:'sell_photos', name:'Stock Photography',  icon:'Sp', iconClass:'ic-teal',   hobbyReq:'photography', minSkill:20, minSmarts:0,  desc:'License your photos online.',             incomeRange:[40,  600]  },
    { id:'freelance',   name:'Freelance Coding',   icon:'Fc', iconClass:'ic-blue',   hobbyReq:'coding',      minSkill:30, minSmarts:0,  desc:'Build websites and apps for hire.',       incomeRange:[150,2500]  },
    { id:'ghost_write', name:'Ghost Writing',      icon:'Gw', iconClass:'ic-blue',   hobbyReq:'writing',     minSkill:25, minSmarts:0,  desc:'Write content and articles for clients.', incomeRange:[60,  900]  },
    { id:'freelance_video',name:'Freelance Video', icon:'Fv', iconClass:'ic-orange', hobbyReq:'filmmaking',  minSkill:25, minSmarts:0,  desc:'Film events and commercials.',            incomeRange:[100,1400]  },
    { id:'sell_designs',name:'Sell Designs',       icon:'Sd', iconClass:'ic-rose',   hobbyReq:'fashion',     minSkill:20, minSmarts:0,  desc:'Sell fashion designs and handmade items.',incomeRange:[60,1100]  },
    { id:'teach_dance', name:'Teach Dance',        icon:'Td', iconClass:'ic-rose',   hobbyReq:'dance',       minSkill:40, minSmarts:0,  desc:'Run local dance classes.',                incomeRange:[80,  700]  },
    { id:'tutoring',    name:'Tutoring',           icon:'Tn', iconClass:'ic-blue',   hobbyReq:null,          minSkill:0,  minSmarts:65, desc:'Tutor students in subjects you excel at.',incomeRange:[25,  250]  },
    { id:'odd_jobs',    name:'Odd Jobs',           icon:'Oj', iconClass:'ic-amber',  hobbyReq:null,          minSkill:0,  minSmarts:0,  desc:'Help neighbors, do errands and gigs.',    incomeRange:[15,  120]  },
  ];

  function getSideHustle(id) { return SIDE_HUSTLES.find(s => s.id === id) || null; }
  function getAvailableSideHustles(character) {

    return SIDE_HUSTLES.filter(sh => {
      if (sh.minSmarts && character.smarts < sh.minSmarts) return false;
      if (!sh.hobbyReq) return true;
      const hobby = character.hobbies.find(h => h.id === sh.hobbyReq);
      return hobby && hobby.skillLevel >= sh.minSkill;
    });
  }

  // ── Moods ────────────────────────────────────────────────────────
  // statMod: multiplier applied to positive drift of that stat while mood active
  const MOODS = [
    { id:'in_love',     name:'In Love',       color:'var(--pink)',   desc:'Heart full of butterflies.',       statMod:{ happiness:0.25, mentalHealth:0.15 } },
    { id:'heartbroken', name:'Heartbroken',   color:'var(--red)',    desc:'Still picking up the pieces.',      statMod:{ happiness:-0.3, mentalHealth:-0.2 } },
    { id:'inspired',    name:'Inspired',      color:'var(--accent)', desc:'Ideas flowing freely.',             statMod:{ smarts:0.2, happiness:0.1 } },
    { id:'anxious',     name:'Anxious',       color:'var(--yellow)', desc:'Something feels off.',              statMod:{ mentalHealth:-0.25, health:-0.1 } },
    { id:'excited',     name:'Excited',       color:'var(--orange)', desc:'Big things are coming.',            statMod:{ happiness:0.2, health:0.1 } },
    { id:'content',     name:'Content',       color:'var(--green)',  desc:'Everything feels just right.',      statMod:{ happiness:0.15, mentalHealth:0.2 } },
    { id:'stressed',    name:'Stressed',      color:'var(--red)',    desc:'Too much on your plate.',           statMod:{ mentalHealth:-0.3, health:-0.1 } },
    { id:'melancholic', name:'Melancholic',   color:'var(--blue)',   desc:'Reflective and quiet.',             statMod:{ happiness:-0.15, smarts:0.1 } },
    { id:'grateful',    name:'Grateful',      color:'var(--teal)',   desc:'Counting your blessings.',          statMod:{ happiness:0.15, mentalHealth:0.2 } },
    { id:'adventurous', name:'Adventurous',   color:'var(--orange)', desc:'Ready for anything.',               statMod:{ happiness:0.2, health:0.1 } },
  ];
  function getMood(id) { return MOODS.find(m => m.id === id) || null; }

  // ── Health Conditions ───────────────────────────────────────────
  const HEALTH_CONDITIONS = [
    { id:'anxiety',     name:'Anxiety Disorder', manageCost:120, desc:'Persistent anxiety affecting daily life.', drain:{ mentalHealth:-3, happiness:-1 } },
    { id:'allergies',   name:'Allergies',         manageCost:50,  desc:'Seasonal and environmental allergies.',    drain:{ health:-2 } },
    { id:'diabetes',    name:'Type 2 Diabetes',   manageCost:200, desc:'Requires lifestyle management.',           drain:{ health:-3, happiness:-1 } },
    { id:'back_pain',   name:'Chronic Back Pain', manageCost:150, desc:'Persistent pain affecting mobility.',      drain:{ health:-2, happiness:-2 } },
    { id:'insomnia',    name:'Insomnia',           manageCost:100, desc:'Difficulty sleeping well.',                drain:{ mentalHealth:-3, health:-1 } },
    { id:'hypertension',name:'Hypertension',       manageCost:100, desc:'High blood pressure requiring monitoring.',drain:{ health:-2 } },
  ];
  function getCondition(id) { return HEALTH_CONDITIONS.find(c => c.id === id) || null; }

  // ── Bucket Goals ────────────────────────────────────────────────
  const BUCKET_GOALS = [
    { id:'find_love',    name:'Find True Love',          icon:'Lo', desc:'Get married or be with a long-term partner.' },
    { id:'travel_5',     name:'Visit 5 Destinations',    icon:'Tr', desc:'Collect at least 5 travel stamps.' },
    { id:'millionaire',  name:'Become a Millionaire',    icon:'Mi', desc:'Reach $1,000,000 net worth.' },
    { id:'famous',       name:'Reach Fame 80',           icon:'Fa', desc:'Become notably famous.' },
    { id:'child',        name:'Have a Child',            icon:'Ch', desc:'Welcome a child into your life.' },
    { id:'doctorate',    name:'Earn a Doctorate',        icon:'Dr', desc:'Complete the highest academic degree.' },
    { id:'own_home',     name:'Own Your Home',           icon:'Ho', desc:'Purchase at least one property.' },
    { id:'live_to_90',   name:'Live to 90',              icon:'90', desc:'Reach the age of 90.' },
    { id:'hobby_master', name:'Master a Hobby',          icon:'Sk', desc:'Reach skill 90 in any hobby.' },
    { id:'world_traveler',name:'Visit Every Region',    icon:'Gl', desc:'Travel to all 7 world regions.' },
    { id:'top_career',   name:'Reach Career Peak',       icon:'Cp', desc:'Reach the top promotion in any career.' },
    { id:'social_butterfly',name:'Build a Social Circle',icon:'Sc', desc:'Have 3+ people in your social circle.' },
  ];

  // ── Styles ──────────────────────────────────────────────────────
  const STYLES = [
    { id:'casual',       name:'Casual',       looks:0,  desc:'Everyday comfortable wear.' },
    { id:'professional', name:'Professional', looks:3,  desc:'Sharp and polished.',        careerBoost:['lawyer','corporate_manager','accountant'] },
    { id:'artistic',     name:'Artistic',     looks:2,  desc:'Expressive and creative.',   careerBoost:['visual_artist','musician','actor','fashion_designer'] },
    { id:'edgy',         name:'Edgy',         looks:2,  desc:'Bold and distinctive.',      careerBoost:['tattoo_artist','musician','content_creator'] },
    { id:'sporty',       name:'Sporty',       looks:2,  desc:'Athletic and active.',       healthBonus:3 },
    { id:'elegant',      name:'Elegant',      looks:5,  desc:'Refined and timeless.',      careerBoost:['actor','fashion_designer'] },
  ];

  const ACTIVITIES = [
    { id:'gym',          name:'Hit the Gym',       icon:'Gy', iconClass:'ic-green',  cost:50,  desc:'+12 Health',                    effects:{ health:12 },                  minAge:12 },
    { id:'meditate',     name:'Meditate',          icon:'Md', iconClass:'ic-teal',   cost:0,   desc:'+10 Happiness',                 effects:{ happiness:10 },               minAge:10 },
    { id:'library',      name:'Visit the Library', icon:'Li', iconClass:'ic-blue',   cost:0,   desc:'+8 Smarts',                     effects:{ smarts:8 },                   minAge:6  },
    { id:'spa',          name:'Spa Day',           icon:'Sp', iconClass:'ic-rose',   cost:150, desc:'+8 Happy, +5 Looks',            effects:{ happiness:8, looks:5 },       minAge:18 },
    { id:'doctor',       name:'See the Doctor',    icon:'Dr', iconClass:'ic-green',  cost:200, desc:'+15 Health',                    effects:{ health:15 },                  minAge:0  },
    { id:'therapy',      name:'Therapy Session',   icon:'Th', iconClass:'ic-purple', cost:120, desc:'+12 Happy, +5 Smarts',         effects:{ happiness:12, smarts:5 },     minAge:14 },
    { id:'diet',         name:'Healthy Eating',    icon:'Di', iconClass:'ic-green',  cost:80,  desc:'+8 Health, +3 Looks',           effects:{ health:8, looks:3 },          minAge:12 },
    { id:'nightlife',    name:'Nightlife',         icon:'Ni', iconClass:'ic-purple', cost:200, desc:'+12 Happy, -8 Health',          effects:{ happiness:12, health:-8 },    minAge:18 },
    { id:'casino',       name:'Casino Night',      icon:'Ca', iconClass:'ic-amber',  cost:0,   desc:'Gamble your money.',           effects:{},   casino:true,               minAge:21 },
    { id:'volunteer',    name:'Volunteer',         icon:'Vo', iconClass:'ic-green',  cost:0,   desc:'+15 Happy, +3 Smarts',         effects:{ happiness:15, smarts:3 },     minAge:14 },
    { id:'park',         name:'Walk in the Park',  icon:'Pa', iconClass:'ic-teal',   cost:0,   desc:'+6 Health, +6 Happy',          effects:{ health:6, happiness:6 },      minAge:5  },
    { id:'invest_stocks',name:'Buy Stocks',        icon:'St', iconClass:'ic-blue',   cost:0,   desc:'Invest in the stock market.',  effects:{},   stocks:true,               minAge:18 },
    { id:'buy_crypto',   name:'Buy Crypto',        icon:'Cr', iconClass:'ic-amber',  cost:0,   desc:'High risk, could 10x or zero.',effects:{},   crypto:true,               minAge:18 },
    { id:'plastic_surgery',name:'Cosmetic Surgery',icon:'CS', iconClass:'ic-rose',   cost:8000,desc:'+12 Looks',                   effects:{ looks:12 },                   minAge:18 },
    { id:'eat_junk',     name:'Junk Food Week',    icon:'Jk', iconClass:'ic-amber',  cost:30,  desc:'-5 Health, +5 Happy',          effects:{ health:-5, happiness:5 },     minAge:0  },
    { id:'take_class',   name:'Online Course',     icon:'OC', iconClass:'ic-blue',   cost:300, desc:'+10 Smarts',                   effects:{ smarts:10 },                  minAge:14 },
  ];

  // ── Creative Project Definitions ───────────────────────────────
  const CREATIVE_PROJECT_DEFS = {
    book: {
      label:'Write a Book', emoji:'📚',
      genres:['Fiction','Non-Fiction','Thriller','Romance','Sci-Fi','Fantasy','Mystery','Biography','Self-Help','Historical'],
      scopes:[
        { id:'short_story', label:'Short Story',  royaltyMod:0.3  },
        { id:'novel',       label:'Novel',         royaltyMod:1.0  },
        { id:'epic',        label:'Epic Novel',    royaltyMod:1.8  },
      ],
      careers:['novelist','journalist','screenwriter','content_creator'],
      statKey:'smarts', hobbyKey:'writing',
      receptionDesc:['Barely noticed','A quiet debut','A solid read','A bestseller','A literary masterpiece'],
      titleWords:{ pre:['The Last','A Silent','The Golden','Lost in','The Infinite','Dark','The Broken','Wild','The Secret','After'],
                   suf:['Summer','Storm','Echo','Dream','Shadow','Hours','Road','Heart','Sky','Night','Garden','Promise'] },
    },
    song: {
      label:'Release Music', emoji:'🎵',
      genres:['Pop','Hip-Hop','R&B','Rock','Electronic','Jazz','Country','Indie','Latin','Classical'],
      scopes:[
        { id:'single', label:'Single',          royaltyMod:0.4 },
        { id:'ep',     label:'EP (5 tracks)',   royaltyMod:1.0 },
        { id:'album',  label:'Album',           royaltyMod:2.2 },
      ],
      careers:['musician','music_producer','content_creator','dancer'],
      statKey:'smarts', hobbyKey:'music',
      receptionDesc:['Forgettable','Growing fanbase','A solid hit','Chart-topper','Generation-defining anthem'],
      titleWords:{ pre:['Late Night','Sweet','Cold','Midnight','Electric','Neon','Faded','Golden','Wild','Forever'],
                   suf:['Dance','Lover','Fire','Rain','Nights','Dream','Wave','Star','Heat','Soul'] },
    },
    film: {
      label:'Make a Film', emoji:'🎬',
      genres:['Drama','Comedy','Action','Horror','Sci-Fi','Romance','Documentary','Thriller','Animation','Crime'],
      scopes:[
        { id:'short',   label:'Short Film',    royaltyMod:0.35 },
        { id:'indie',   label:'Indie Film',    royaltyMod:1.0  },
        { id:'feature', label:'Feature Film',  royaltyMod:2.5  },
      ],
      careers:['filmmaker','actor','screenwriter'],
      statKey:'smarts', hobbyKey:'filmmaking',
      receptionDesc:['A box-office flop','A cult classic','Critically acclaimed','Award-winning','A cinematic masterpiece'],
      titleWords:{ pre:['The Last','Beyond','Into the','Before the','The','Shattered','Running from','Among the','The Dark'],
                   suf:['Sunrise','City','Horizon','Storm','Edge','Light','Silence','Mirror','Fire','Abyss'] },
    },
    play: {
      label:'Stage a Play', emoji:'🎭',
      genres:['Drama','Comedy','Musical','Tragedy','Experimental','Thriller','Romance'],
      scopes:[
        { id:'local',    label:'Local Theater',      royaltyMod:0.3 },
        { id:'regional', label:'Regional Run',       royaltyMod:1.0 },
        { id:'broadway', label:'Broadway / West End',royaltyMod:2.5 },
      ],
      careers:['actor','comedian','voice_actor'],
      statKey:'looks', hobbyKey:'theater',
      receptionDesc:['Mixed reviews','A modest run','Standing ovations','Sold-out season','Tony Award winner'],
      titleWords:{ pre:['The','A Night in','When','After','The Last','Between','One','The','Shadows of'],
                   suf:['Rain','Summer','Wings','Curtain','Stage','Voice','Memory','Silence','Act','Fortune'] },
    },
    series: {
      label:'Launch a Series', emoji:'📺',
      genres:['Lifestyle','Comedy','Drama','Tutorial','Reality','Travel','Gaming','Fashion','True Crime'],
      scopes:[
        { id:'mini',      label:'Mini-Series (3 ep)',   royaltyMod:0.4 },
        { id:'season',    label:'Full Season (8 ep)',   royaltyMod:1.0 },
        { id:'franchise', label:'Long-Running Series',  royaltyMod:2.0 },
      ],
      careers:['content_creator','comedian','filmmaker','actor'],
      statKey:'looks', hobbyKey:'filmmaking',
      receptionDesc:['Flopped','Niche following','Fan favourite','Viral series','Cultural phenomenon'],
      titleWords:{ pre:['Keeping Up','Living','Real','The','Simply','Unfiltered','Getting'],
                   suf:['With Me','Life','Vibes','Days','Stories','Honestly','Raw','Together'] },
    },
    collection: {
      label:'Release a Collection', emoji:'🎨',
      genres:['Abstract','Portrait','Landscape','Street Art','Digital','Fashion','Photography','Sculpture'],
      scopes:[
        { id:'small',      label:'Small Collection',  royaltyMod:0.4 },
        { id:'gallery',    label:'Gallery Show',      royaltyMod:1.0 },
        { id:'exhibition', label:'Major Exhibition',  royaltyMod:2.0 },
      ],
      careers:['visual_artist','graphic_designer','fashion_designer','tattoo_artist','photographer'],
      statKey:'looks', hobbyKey:'drawing',
      receptionDesc:['Overlooked','Gallery darling','Critically praised','Sold out opening','Historic masterwork'],
      titleWords:{ pre:['Shades of','Forms in','The','Between','Broken','Woven','Light Through','Echoes of'],
                   suf:['Colour','Space','Time','Silence','Motion','Glass','Stone','Water','Skin'] },
    },
    performance: {
      label:'Choreograph a Show', emoji:'💃',
      genres:['Ballet','Contemporary','Hip-Hop','Latin','Ballroom','Jazz','Street','Fusion'],
      scopes:[
        { id:'local',    label:'Local Show',    royaltyMod:0.3 },
        { id:'national', label:'National Tour', royaltyMod:1.0 },
        { id:'world',    label:'World Tour',    royaltyMod:2.5 },
      ],
      careers:['dancer'],
      statKey:'health', hobbyKey:'dance',
      receptionDesc:['A decent show','Audience loved it','Rave reviews','Sold-out world tour','A legendary performance'],
      titleWords:{ pre:['In','Moving','The','Pulse','Fluid','Rise','Between'],
                   suf:['Motion','Rhythm','Waves','Fire','Bodies','Time','Light','Ground'] },
    },
  };

  // ── Sport Definitions ───────────────────────────────────────────
  const SPORT_DEFS = {
    football:   {
      label:'Football', icon:'⚽',
      gamesPerSeason:38,
      positions:['Striker','Midfielder','Defender','Goalkeeper'],
      championships:[
        { name:'League Title',       winsMin:25 },
        { name:'Cup Final',          winsMin:20 },
        { name:'Champions League',   winsMin:30 },
        { name:'World Cup',          winsMin:34 },
      ],
    },
    tennis:     {
      label:'Tennis', icon:'🎾',
      gamesPerSeason:20,
      positions:['Player'],
      championships:[
        { name:'Australian Open',  winsMin:7  },
        { name:'French Open',      winsMin:8  },
        { name:'Wimbledon',        winsMin:8  },
        { name:'US Open',          winsMin:8  },
        { name:'World No.1',       winsMin:18 },
      ],
    },
    basketball: {
      label:'Basketball', icon:'🏀',
      gamesPerSeason:82,
      positions:['Point Guard','Shooting Guard','Small Forward','Power Forward','Center'],
      championships:[
        { name:'All-Star Selection',    winsMin:40 },
        { name:'Conference Finals',     winsMin:50 },
        { name:'NBA Championship',      winsMin:55 },
        { name:'Finals MVP',            winsMin:58 },
      ],
    },
    swimming:   {
      label:'Swimming', icon:'🏊',
      gamesPerSeason:12,
      positions:['Freestyle','Backstroke','Breaststroke','Butterfly','Medley'],
      championships:[
        { name:'National Championship', winsMin:7  },
        { name:'World Championships',   winsMin:9  },
        { name:'Olympic Gold',          winsMin:11 },
        { name:'World Record',          winsMin:12 },
      ],
    },
    boxing:     {
      label:'Boxing', icon:'🥊',
      gamesPerSeason:4,
      positions:['Lightweight','Welterweight','Middleweight','Heavyweight'],
      championships:[
        { name:'Regional Title',        winsMin:2 },
        { name:'National Title',        winsMin:3 },
        { name:'World Title Fight',     winsMin:4 },
        { name:'Undisputed Champion',   winsMin:4 },
      ],
    },
  };

  const ACHIEVEMENTS = [
    { id:'centenarian',      name:'Centenarian',       desc:'Live to age 100.' },
    { id:'millionaire',      name:'Millionaire',       desc:'Accumulate $1,000,000.' },
    { id:'billionaire',      name:'Billionaire',       desc:'Accumulate $1,000,000,000.' },
    { id:'happily_ever_after',name:'Happily Ever After',desc:'Get married.' },
    { id:'parent',           name:'Parent',            desc:'Have a child.' },
    { id:'grandparent',      name:'Grandparent',       desc:'Become a grandparent.' },
    { id:'top_of_career',    name:'Career Pinnacle',   desc:'Reach the top promotion.' },
    { id:'doctor_life',      name:"Doctor's Orders",   desc:'Become a Doctor.' },
    { id:'law_of_the_land',  name:'Law of the Land',   desc:'Become a Lawyer.' },
    { id:'famous',           name:'Famous',            desc:'Reach 50 fame.' },
    { id:'super_famous',     name:'A-List',            desc:'Reach 90 fame.' },
    { id:'smart_cookie',     name:'Genius',            desc:'Reach 95 Smarts.' },
    { id:'health_nut',       name:'Iron Body',         desc:'Reach 95 Health.' },
    { id:'scholar',          name:'Scholar',           desc:'Earn a doctorate degree.' },
    { id:'polyglot_career',  name:'Career Hopper',     desc:'Hold 5 different jobs.' },
    { id:'self_made',        name:'Self-Made',         desc:'Reach $500K from poverty.' },
    { id:'creative_spirit',  name:'Creative Spirit',   desc:'Work in an artistic career 10 years.' },
    { id:'long_marriage',    name:'Golden Anniversary',desc:'Stay married for 50 years.' },
    { id:'hobby_master',     name:'Hobby Master',      desc:'Reach skill 80 in any hobby.' },
    { id:'renaissance',      name:'Renaissance Soul',  desc:'Reach skill 50 in 3 different hobbies.' },
  ];

  // ── Helpers ────────────────────────────────────────────────────
  function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function randomName(gender, country = null) {
    const pool  = getCountryNamePool(country);
    const first = randomFrom(gender === 'female' ? pool.female : pool.male);
    const last  = randomFrom(pool.last);
    return { first, last, full: `${first} ${last}` };
  }

  function randomCountry() { return randomFrom(COUNTRIES); }

  function randomWealthClass() {
    const r = Math.random();
    if (r < 0.08) return WEALTH_CLASSES[0];
    if (r < 0.25) return WEALTH_CLASSES[1];
    if (r < 0.65) return WEALTH_CLASSES[2];
    if (r < 0.85) return WEALTH_CLASSES[3];
    if (r < 0.96) return WEALTH_CLASSES[4];
    return WEALTH_CLASSES[5];
  }

  function randomTraits(count = 2) {
    return [...TRAITS].sort(() => Math.random() - 0.5).slice(0, count);
  }

  function getStage(age) {
    if (age <= 5)  return 'infant';
    if (age <= 12) return 'child';
    if (age <= 17) return 'teen';
    if (age <= 25) return 'young_adult';
    if (age <= 55) return 'adult';
    return 'senior';
  }

  function filterEvents(gameState, usedOnce, count = 3) {
    const { character, relationships } = gameState;
    const age   = character.age;
    const stage = getStage(age);
    const hasPartner = relationships.some(r => r.type === 'partner' && r.status === 'active');
    const jobCat = character.career.jobId ? (CAREERS[character.career.jobId] || {}).category : null;
    const isLgbt = character.sexuality !== 'straight' || character.genderIdentity !== 'cis';

    const available = EVENTS.filter(ev => {
      if (ev.once && usedOnce.has(ev.id)) return false;
      if (ev.stage !== 'any' && ev.stage !== stage) return false;
      if (ev.minAge && age < ev.minAge) return false;
      if (ev.maxAge && age > ev.maxAge) return false;
      if (ev.requiresPartner && !hasPartner) return false;
      if (ev.requiresJobCat) { if (!jobCat || ev.requiresJobCat !== jobCat) return false; }
      if (ev.isLgbt && !isLgbt) return false;
      if (ev.requiresParent) {
        const hasLivingParent = relationships.some(r => (r.subtype==='father'||r.subtype==='mother') && r.status==='active');
        if (!hasLivingParent) return false;
      }
      // sexuality discovery event only fires if not yet known
      if (ev.id === 'coming_out_decision' && character.sexualityKnown === false) return true;
      if (ev.id === 'coming_out_decision' && character.sexualityKnown !== false) return false;
      return true;
    });

    const picked = [];
    const pool   = [...available];
    const target = Math.min(count, pool.length);

    while (picked.length < target && pool.length > 0) {
      const total = pool.reduce((s, e) => s + (e.weight || 5), 0);
      let r = Math.random() * total;
      let idx = 0;
      for (let i = 0; i < pool.length; i++) { r -= (pool[i].weight || 5); if (r <= 0) { idx = i; break; } }
      picked.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return picked;
  }

  function getCareer(id)   { return CAREERS[id] || null; }
  function getAllCareers()  { return Object.values(CAREERS); }
  function getActivities() { return ACTIVITIES; }
  function getHobby(id)    { return HOBBIES.find(h => h.id === id) || null; }
  function getAllHobbies()  { return HOBBIES; }

  function meetsCareerReqs(career, character) {
    const req = career.requirements;
    if (!req) return { meets:true };
    const missing = [];
    if (req.minAge    && character.age    < req.minAge)    missing.push(`Age ${req.minAge}+`);
    if (req.minSmarts && character.smarts < req.minSmarts) missing.push(`${req.minSmarts} Smarts`);
    if (req.minLooks  && character.looks  < req.minLooks)  missing.push(`${req.minLooks} Looks`);
    if (req.minHealth && character.health < req.minHealth) missing.push(`${req.minHealth} Health`);
    if (req.education) {
      const levels = ['none','elementary','middleschool','highschool','tradeschool','some_college','bachelor','master','doctorate'];
      if (levels.indexOf(character.education.level) < levels.indexOf(req.education)) missing.push(`${req.education} degree`);
    }
    if (req.degree && req.degree[0] !== 'Any') {
      const hasMajor = req.degree.includes(character.education.major);
      if (!hasMajor) missing.push(`Degree in ${req.degree.join(' or ')}`);
    }
    if (req.certificate && !character.education.certificates.includes(req.certificate)) {
      const cert = TRADE_CERTIFICATES.find(c => c.id === req.certificate);
      missing.push(cert ? cert.name : req.certificate);
    }
    return { meets: missing.length === 0, missing };
  }

  // Returns hobby skill bonus for a career (0–1 multiplier bonus)
  function getHobbyCareerBonus(hobbies, careerId) {
    if (!hobbies || hobbies.length === 0) return 0;
    let best = 0;
    for (const hEntry of hobbies) {
      const hDef = HOBBIES.find(h => h.id === hEntry.id);
      if (!hDef) continue;
      if (hDef.careerBoost.includes(careerId)) {
        best = Math.max(best, hEntry.skillLevel);
      }
    }
    return best / 100; // 0.0–1.0
  }

  function fmtMoney(n) {
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    if (abs >= 1e9) return sign + '$' + (abs / 1e9).toFixed(1) + 'B';
    if (abs >= 1e6) return sign + '$' + (abs / 1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return sign + '$' + (abs / 1e3).toFixed(1) + 'K';
    return sign + '$' + Math.round(abs).toLocaleString();
  }

  function randomProjectTitle(type) {
    const def = CREATIVE_PROJECT_DEFS[type];
    if (!def || !def.titleWords) return 'Untitled';
    const { pre, suf } = def.titleWords;
    return `${randomFrom(pre)} ${randomFrom(suf)}`;
  }

  return {
    MALE_NAMES, FEMALE_NAMES, LAST_NAMES, COUNTRIES, WEALTH_CLASSES,
    EVENTS, CAREERS, HOBBIES, EXTRACURRICULARS, UNIVERSITY_MAJORS, TRADE_CERTIFICATES, ACTIVITIES, ACHIEVEMENTS,
    SEXUALITIES, GENDER_IDENTITIES,
    ITEMS, PETS, TRAVEL_DESTINATIONS, SIDE_HUSTLES, MOODS, HEALTH_CONDITIONS, BUCKET_GOALS, STYLES,
    CREATIVE_PROJECT_DEFS, SPORT_DEFS,
    generateFamilyNames, getCountryNamePool, randomProjectTitle,
    randomFrom, randomName, randomCountry, randomWealthClass, randomTraits,
    getStage, filterEvents, getCareer, getAllCareers, getActivities, getHobby, getAllHobbies,
    getExtracurricular, getAllExtracurriculars, getAttractedGender,
    getItem, getAllItems, getItemsByCategory,
    getPet, getTravelDest, getSideHustle, getAvailableSideHustles,
    getMood, getCondition,
    meetsCareerReqs, getHobbyCareerBonus, getExtracurricularCareerBonus, fmtMoney,
  };
})();
