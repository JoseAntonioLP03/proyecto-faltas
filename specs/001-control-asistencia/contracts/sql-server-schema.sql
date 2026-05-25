IF OBJECT_ID('dbo.Faltas', 'U') IS NOT NULL DROP TABLE dbo.Faltas;
IF OBJECT_ID('dbo.UsuariosMirror', 'U') IS NOT NULL DROP TABLE dbo.UsuariosMirror;
IF OBJECT_ID('dbo.CursosMirror', 'U') IS NOT NULL DROP TABLE dbo.CursosMirror;
IF OBJECT_ID('dbo.RolesMirror', 'U') IS NOT NULL DROP TABLE dbo.RolesMirror;
GO

CREATE TABLE dbo.RolesMirror (
    IdRole TINYINT NOT NULL,
    Rolename NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_RolesMirror PRIMARY KEY (IdRole),
    CONSTRAINT CK_RolesMirror_IdRole CHECK (IdRole IN (1, 2, 3)),
    CONSTRAINT UQ_RolesMirror_Rolename UNIQUE (Rolename)
);
GO

INSERT INTO dbo.RolesMirror (IdRole, Rolename)
VALUES (1, N'Profesor'), (2, N'Alumno'), (3, N'Administrador');
GO

CREATE TABLE dbo.UsuariosMirror (
    Id INT NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Apellidos NVARCHAR(150) NOT NULL,
    Email NVARCHAR(254) NOT NULL,
    EstadoUsuario BIT NOT NULL,
    Imagen NVARCHAR(500) NULL,
    IdRole TINYINT NOT NULL,
    CONSTRAINT PK_UsuariosMirror PRIMARY KEY (Id),
    CONSTRAINT UQ_UsuariosMirror_Email UNIQUE (Email),
    CONSTRAINT FK_UsuariosMirror_RolesMirror FOREIGN KEY (IdRole) REFERENCES dbo.RolesMirror (IdRole)
);
GO

CREATE TABLE dbo.CursosMirror (
    IdCurso INT NOT NULL,
    Nombre NVARCHAR(150) NOT NULL,
    DuracionHoras INT NOT NULL,
    Activo BIT NOT NULL,
    CONSTRAINT PK_CursosMirror PRIMARY KEY (IdCurso),
    CONSTRAINT CK_CursosMirror_DuracionHoras CHECK (DuracionHoras > 0)
);
GO

CREATE TABLE dbo.Faltas (
    Id INT IDENTITY(1,1) NOT NULL,
    IdUsuario INT NOT NULL,
    IdCurso INT NOT NULL,
    FechaIncidencia DATETIME2(0) NOT NULL,
    TipoFalta VARCHAR(20) NOT NULL,
    EsJustificada BIT NOT NULL CONSTRAINT DF_Faltas_EsJustificada DEFAULT (0),
    Comentario NVARCHAR(500) NULL,
    CONSTRAINT PK_Faltas PRIMARY KEY (Id),
    CONSTRAINT FK_Faltas_UsuariosMirror FOREIGN KEY (IdUsuario) REFERENCES dbo.UsuariosMirror (Id),
    CONSTRAINT FK_Faltas_CursosMirror FOREIGN KEY (IdCurso) REFERENCES dbo.CursosMirror (IdCurso),
    CONSTRAINT CK_Faltas_TipoFalta CHECK (TipoFalta IN ('Falta', 'Retraso', 'Salida de antes'))
);
GO

CREATE INDEX IX_Faltas_IdUsuario_FechaIncidencia ON dbo.Faltas (IdUsuario, FechaIncidencia DESC);
CREATE INDEX IX_Faltas_IdCurso_FechaIncidencia ON dbo.Faltas (IdCurso, FechaIncidencia DESC);
GO